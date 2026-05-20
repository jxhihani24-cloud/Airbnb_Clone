using System.ComponentModel.DataAnnotations;

namespace Hostera.Dtos;

public class UpdateAccountRequest
{
    [Required]
    [StringLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [StringLength(30)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string? Gender { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    [Required]
    [StringLength(50)]
    public string? Country { get; set; }

    [Required]
    [Phone]
    [StringLength(30)]
    public string? PhoneNumber { get; set; }
}