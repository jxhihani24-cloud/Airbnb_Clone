namespace Hostera.Models;

public class Payment
{
    public Guid Id { get; set; }

    public Guid BookingId { get; set; }
    public Booking Booking { get; set; } = null!;

    public string Method { get; set; } = "";
    public string Status { get; set; } = "Completed";

    public decimal Amount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}