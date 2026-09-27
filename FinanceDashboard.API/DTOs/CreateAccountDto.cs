using System.ComponentModel.DataAnnotations;

namespace FinanceDashboard.API.DTOs
{
    public class CreateAccountDto
    {
        [Required(ErrorMessage = "A felhasználó azonosítója kötelező!")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "A számla neve kötelező!")]
        public string Name { get; set; } = string.Empty;

        public string Currency { get; set; } = "HUF";

        public decimal Balance { get; set; }
    }
}
