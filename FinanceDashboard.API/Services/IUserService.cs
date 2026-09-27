using FinanceDashboard.API.DTOs;

namespace FinanceDashboard.API.Services
{
    public interface IUserService
    {
        Task<IEnumerable<UserResponseDto>> GetUsersAsync();
        Task<UserResponseDto> CreateUserAsync(CreateUserDto dto);
        Task<bool> UpdateUserAsync(int id, UpdateUserDto dto);
        Task<bool> DeleteUserAsync(int id);

        Task<(bool IsSuccess, string ErrorMessage)> ChangePasswordAsync(int id, ChangePasswordDto dto);

        Task<string?> LoginAsync(LoginDto dto);
    }
}
