using FinanceDashboard.API.DTOs;

namespace FinanceDashboard.API.Services
{
    public interface IAccountService
    {
        Task<IEnumerable<AccountResponseDto>> GetAccountsAsync(int userId);
        Task<AccountResponseDto> GetAccountAsync(int Id);
        Task<AccountResponseDto> CreateAccountAsync(CreateAccountDto dto);
        Task<bool> UpdateAccountAsync(int id, UpdateAccountDto dto, int UserId);
        Task<bool> DeleteAccountAsync(int id, int UserId);
    }
}
