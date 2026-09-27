using FinanceDashboard.API.Data;
using FinanceDashboard.API.DTOs;
using FinanceDashboard.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceDashboard.API.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ApplicationDbContext _context;

        public TransactionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TransactionResponseDto>> GetTransactionsAsync(int userId)
        {
            return await _context.Transactions
                .Include(t => t.Account)
                .Where(t => t.Account.UserId == userId)
                .OrderByDescending(t => t.Date)
                .Select(t => new TransactionResponseDto
                {
                    Id = t.Id,
                    AccountId = t.AccountId,
                    Amount = t.Amount,
                    Category = t.Category,
                    Description = t.Description,
                    Date = t.Date
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<TransactionResponseDto>> GetTransactionsByAccountIdAsync(int accountId)
        {
            return await _context.Transactions
                .Where(t => t.AccountId == accountId)
                .OrderByDescending(t => t.Date)
                .Select(t => new TransactionResponseDto
                {
                    Id = t.Id,
                    AccountId = t.AccountId,
                    Amount = t.Amount,
                    Category = t.Category,
                    Description = t.Description,
                    Date = t.Date
                })
                .ToListAsync();
        }

        public async Task<TransactionResponseDto> CreateTransactionAsync(CreateTransactionDto dto)
        {
            var account = await _context.Accounts.FindAsync(dto.AccountId);
            if (account == null)
            {
                throw new Exception("A megadott számla nem található.");
            }

            account.Balance += dto.Amount;

            var transaction = new Transaction
            {
                AccountId = dto.AccountId,
                Amount = dto.Amount,
                Category = dto.Category,
                Description = dto.Description,
                Date = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return new TransactionResponseDto
            {
                Id = transaction.Id,
                AccountId = transaction.AccountId,
                Amount = transaction.Amount,
                Category = transaction.Category,
                Description = transaction.Description,
                Date = transaction.Date
            };
        }

        public async Task<bool> UpdateTransactionAsync(int id, UpdateTransactionDto dto)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null) { return false; }

            var account = await _context.Accounts.FindAsync(transaction.AccountId);
            if(account != null)
            {
                account.Balance -= transaction.Amount;
                account.Balance += dto.Amount;
            }

            transaction.Amount = dto.Amount;
            transaction.Category = dto.Category;
            transaction.Description = dto.Description;
            transaction.Date = dto.Date;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteTransactionAsync(int id, int userId)
        {
            var transaction = await _context.Transactions
                .Include(t => t.Account)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (transaction == null)
            {
                return false;
            }

            if (transaction.Account != null && transaction.Account.UserId != userId)
            {
                throw new UnauthorizedAccessException("Nincs jogosultságod törölni ezt a tranzakciót.");
            }

            if (transaction.Account != null)
            {
                transaction.Account.Balance -= transaction.Amount;
            }

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task TransferTransactionAsync(int userId, TransferDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var currentDate = DateTime.UtcNow;

                var sourceAccount = await _context.Accounts.FindAsync(dto.SourceAccountId);
                var destAccount = await _context.Accounts.FindAsync(dto.DestinationAccountId);

                if (sourceAccount == null || destAccount == null)
                    throw new Exception("Valamelyik számla nem található.");

                sourceAccount.Balance -= (Math.Abs(dto.Amount) + Math.Abs(dto.Fee));
                destAccount.Balance += (Math.Abs(dto.Amount) * dto.ExchangeRate);

                var withdrawal = new Transaction
                {
                    AccountId = dto.SourceAccountId,
                    Amount = -Math.Abs(dto.Amount),
                    Category = "Átutalás",
                    Description = dto.Description,
                    Date = currentDate
                };
                _context.Transactions.Add(withdrawal);

                if (dto.Fee > 0)
                {
                    var fee = new Transaction
                    {
                        AccountId = dto.SourceAccountId,
                        Amount = -Math.Abs(dto.Fee),
                        Category = "Bankköltség",
                        Description = "Tranzakciós díj: " + dto.Description,
                        Date = currentDate
                    };
                    _context.Transactions.Add(fee);
                }

                var deposit = new Transaction
                {
                    AccountId = dto.DestinationAccountId,
                    Amount = Math.Abs(dto.Amount) * dto.ExchangeRate,
                    Category = "Átutalás",
                    Description = dto.Description,
                    Date = currentDate
                };
                _context.Transactions.Add(deposit);
                _context.Accounts.Update(sourceAccount);
                _context.Accounts.Update(destAccount);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw new Exception("Hiba az utalás feldolgozása közben. A tranzakció visszavonva.");
            }
        }
    }
}
