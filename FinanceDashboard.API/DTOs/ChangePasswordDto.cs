using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace FinanceDashboard.API.DTOs
{
    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "A jelenlegi jelszó megadása kötelező!")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Az új jelszó megadása kötelező!")]
        public string NewPassword { get; set; } = string.Empty;
    }
}
