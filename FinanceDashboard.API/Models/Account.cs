namespace FinanceDashboard.API.Models
{
    public class Account
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Currency { get; set; } = "HUF";
        public decimal Balance { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
        public ICollection<Transaction> transactions { get; set; } = new List<Transaction>();
    }
}
