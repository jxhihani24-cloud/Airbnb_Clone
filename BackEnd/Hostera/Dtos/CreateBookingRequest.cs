using System.ComponentModel.DataAnnotations;

namespace Hostera.Dtos;

public class CreateBookingRequest
{
    [Required]
    public Guid PropertyId { get; set; }

    [Required]
    public DateOnly CheckInDate { get; set; }

    [Required]
    public DateOnly CheckOutDate { get; set; }

    [Range(1, 50)]
    public int Guests { get; set; }

    [Required]
    [StringLength(30)]
    public string PaymentMethod { get; set; } = string.Empty;
}