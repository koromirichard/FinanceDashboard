using System.ComponentModel.DataAnnotations;

namespace FinanceDashboard.API.DTOs
{
    public class UpdateAccountDto
    {
        [Required(ErrorMessage = "A számla neve kötelező!")]
        public string Name { get; set; } = string.Empty;
        public string Currency { get; set; } = string.Empty;
    }
}
