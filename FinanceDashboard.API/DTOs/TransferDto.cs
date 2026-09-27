namespace FinanceDashboard.API.DTOs
{
    public class TransferDto
    {
        public int SourceAccountId { get; set; }
        public int DestinationAccountId { get; set; }
        public decimal Amount { get; set; }
        public decimal Fee { get; set; }
        public decimal ExchangeRate { get; set; } = 1.0m;
        public string Description { get; set; } = "Belső átutalás";
    }
}
