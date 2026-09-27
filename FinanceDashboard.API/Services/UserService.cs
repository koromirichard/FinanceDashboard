using FinanceDashboard.API.Data;
using FinanceDashboard.API.DTOs;
using FinanceDashboard.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FinanceDashboard.API.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public UserService(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<IEnumerable<UserResponseDto>> GetUsersAsync()
        {
            return await _context.Users
                .Select(u => new UserResponseDto
                    {
                        Id = u.Id,
                        Username = u.Username,
                        Email = u.Email
                        })
                        .ToListAsync();
        }

        public async Task<UserResponseDto> CreateUserAsync(CreateUserDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                throw new Exception("Ez az e-mail cím már foglalt.");
            }

            var user = new User
            {
                Email = dto.Email,
                Username = dto.UserName,

                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username
            };
        }

        public async Task<bool> UpdateUserAsync(int id, UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return false;
            }

            user.Username = dto.UserName;
            user.Email = dto.Email;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return false;
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<(bool IsSuccess, string ErrorMessage)> ChangePasswordAsync(int id, ChangePasswordDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return (false, "A felhasználó nem található.");
            }

            if (user.PasswordHash != dto.CurrentPassword)
            {
                return (false, "A megadott jelenlegi jelszó hibás.");
            }

            user.PasswordHash = dto.NewPassword;

            await _context.SaveChangesAsync();

            return (true, string.Empty);
        }

        public async Task<string?> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null)
            {
                return null;
            }

            try
            {
                if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                {
                    return null;
                }
            }
            catch (BCrypt.Net.SaltParseException)
            {
                return null;
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credintals = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Username ?? user.Email)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credintals);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
