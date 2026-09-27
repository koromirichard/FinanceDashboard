using FinanceDashboard.API.Data;
using FinanceDashboard.API.DTOs;
using FinanceDashboard.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceDashboard.API.Services
{
    public class AccountService : IAccountService
    {
        private readonly ApplicationDbContext _context;

        public AccountService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AccountResponseDto>> GetAccountsAsync(int userId)
        {
            return await _context.Accounts
                    .Where(a => a.UserId == userId)
                    .Select(a => new AccountResponseDto
                    {
                        Id = a.Id,
                        Name = a.Name,
                        Currency = a.Currency,
                        Balance = a.Balance
                    })
                    .ToListAsync();
        }

        public async Task<AccountResponseDto> GetAccountAsync(int Id)
        {
            var account = await _context.Accounts
                .Include(a => a.transactions.OrderByDescending(t => t.Date))
                .FirstOrDefaultAsync(a => a.Id == Id);

            if (account == null)
            {
                return null;
            }

            return new AccountResponseDto
            {
                Id = account.Id,
                Name = account.Name,
                Currency = account.Currency,
                Balance = account.Balance,
                Transactions = account.transactions.Select(t => new TransactionResponseDto
                {
                    Id = t.Id,
                    AccountId = t.AccountId,
                    Amount = t.Amount,
                    Category = t.Category,
                    Description = t.Description,
                    Date = t.Date
                }).ToList()
            };
        }

        public async Task<AccountResponseDto> CreateAccountAsync(CreateAccountDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
            {
                return null;
            }

            var account = new Account
            {
                UserId = dto.UserId,
                Name = dto.Name,
                Currency = dto.Currency,
                Balance = dto.Balance
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            return new AccountResponseDto
            {
                Id = account.Id,
                Name = account.Name,
                Currency = account.Currency,
                Balance = account.Balance
            };
        }

        public async Task<bool> UpdateAccountAsync(int id,  UpdateAccountDto dto, int userId)
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (account == null)
            {
                return false;
            }

            account.Name = dto.Name;
            account.Currency = dto.Currency;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAccountAsync(int id, int userId)
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (account == null)
            {
                return false;
            }

            _context.Accounts.Remove(account);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
