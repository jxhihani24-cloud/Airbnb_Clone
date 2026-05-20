namespace Hostera.Models;

public class Property
{
    public Guid Id { get; set; }

    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    public string Title { get; set; } = "";
    public string City { get; set; } = "";
    public string Country { get; set; } = "";
    public string PropertyType { get; set; } = "";

    public decimal Price { get; set; }

    public int Guests { get; set; }
    public int Bedrooms { get; set; }
    public int Bathrooms { get; set; }

    public string Description { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<PropertyImage> Images { get; set; } = new();
    public List<Booking> Bookings { get; set; } = new();
    public List<Review> Reviews { get; set; } = new();
    public List<Conversation> Conversations { get; set; } = new();
}