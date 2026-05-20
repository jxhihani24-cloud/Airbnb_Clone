namespace Hostera.Models;

public class User
{
    public Guid Id { get; set; }

    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";

    public string Username { get; set; } = "";
    public string Email { get; set; } = "";

    public string PasswordHash { get; set; } = "";

    public string? Gender { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Country { get; set; }
    public string? PhoneNumber { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Property> Properties { get; set; } = new();
    public List<Booking> Bookings { get; set; } = new();
    public List<Review> Reviews { get; set; } = new();
    public List<Conversation> Conversations { get; set; } = new();
    public List<Message> Messages { get; set; } = new();
}