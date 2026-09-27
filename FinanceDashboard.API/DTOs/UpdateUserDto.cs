using System.ComponentModel.DataAnnotations;

namespace FinanceDashboard.API.DTOs
{
    public class UpdateUserDto
    {
        [Required]
        public string UserName { get; set; } = string.Empty;
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
    }
}
