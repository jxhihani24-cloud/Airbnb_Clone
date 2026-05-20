using System.ComponentModel.DataAnnotations;

namespace Hostera.Dtos;

public class CreatePropertyRequest
{
    [Required]
    [StringLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string City { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Country { get; set; } = string.Empty;

    [Required]
    public string PropertyType { get; set; } = string.Empty;

    [Range(1, 100000)]
    public decimal Price { get; set; }

    [Range(1, 50)]
    public int Guests { get; set; }

    [Range(1, 50)]
    public int Bedrooms { get; set; }

    [Range(1, 50)]
    public int Bathrooms { get; set; }

    [Required]
    [StringLength(3000)]
    public string Description { get; set; } = string.Empty;

    public List<string> Images { get; set; } = new();
}