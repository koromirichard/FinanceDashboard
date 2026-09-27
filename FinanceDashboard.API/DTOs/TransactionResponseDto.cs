namespace FinanceDashboard.API.DTOs
{
    public class TransactionResponseDto
    {
        public int Id { get; set; }
        public int AccountId { get; set; }
        public decimal Amount { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime Date {  get; set; }
    }
}
