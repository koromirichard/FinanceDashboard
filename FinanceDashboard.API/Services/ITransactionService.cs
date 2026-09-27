using FinanceDashboard.API.DTOs;

namespace FinanceDashboard.API.Services
{
    public interface ITransactionService
    {
        Task<IEnumerable<TransactionResponseDto>> GetTransactionsAsync(int userId);
        Task<TransactionResponseDto> CreateTransactionAsync(CreateTransactionDto dto);
        Task<bool> UpdateTransactionAsync(int id, UpdateTransactionDto dto);
        Task<bool> DeleteTransactionAsync(int id, int userId);

        Task<IEnumerable<TransactionResponseDto>> GetTransactionsByAccountIdAsync(int accountId);

        Task TransferTransactionAsync(int userId, TransferDto dto);
    }
}
