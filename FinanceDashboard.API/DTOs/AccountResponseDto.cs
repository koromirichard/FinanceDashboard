namespace FinanceDashboard.API.DTOs
{
    public class AccountResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Currency {  get; set; } = string.Empty;
        public decimal Balance { get; set; }

        public List<TransactionResponseDto> Transactions { get; set; } = new();
    }
}
