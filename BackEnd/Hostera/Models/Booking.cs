namespace Hostera.Models;

public class Booking
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid PropertyId { get; set; }
    public Property Property { get; set; } = null!;

    public DateOnly CheckInDate { get; set; }
    public DateOnly CheckOutDate { get; set; }

    public int Guests { get; set; }

    public decimal PricePerNight { get; set; }
    public decimal TotalAmount { get; set; }

    public string Status { get; set; } = "Confirmed";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Payment? Payment { get; set; }
}