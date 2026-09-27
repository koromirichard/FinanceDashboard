using System.ComponentModel.DataAnnotations;

namespace FinanceDashboard.API.DTOs
{
    public class CreateTransactionDto
    {
        [Required(ErrorMessage ="A számla azonosítója kötelező!")]
        public int AccountId { get; set; }

        [Required(ErrorMessage = "Az összeg megadása kötelező!")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "A kategória megadása kötelező!")]
        public string Category { get; set; } = string.Empty;

        public string? Description { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;
    }
}
