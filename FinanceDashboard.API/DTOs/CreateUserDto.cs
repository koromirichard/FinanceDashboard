using System.ComponentModel.DataAnnotations;

namespace FinanceDashboard.API.DTOs
{
    public class CreateUserDto
    {
        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password {  get; set; } = string.Empty;
    }
}
