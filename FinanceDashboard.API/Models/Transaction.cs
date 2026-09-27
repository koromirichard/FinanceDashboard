namespace FinanceDashboard.API.Models
{
    public class Transaction
    {
        public int Id { get; set; }

        public int AccountId { get; set; }

        public decimal Amount { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string Category { get; set; } = string.Empty;
        public string? Description { get; set; }

        public Account? Account { get; set; }
    }
}
