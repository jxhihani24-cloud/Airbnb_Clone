using Hostera.Models;
using Microsoft.EntityFrameworkCore;

namespace Hostera.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<PropertyImage> PropertyImages => Set<PropertyImage>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Property>()
            .Property(p => p.Price)
            .HasColumnType("numeric(10,2)");

        modelBuilder.Entity<Booking>()
            .Property(b => b.PricePerNight)
            .HasColumnType("numeric(10,2)");

        modelBuilder.Entity<Booking>()
            .Property(b => b.TotalAmount)
            .HasColumnType("numeric(10,2)");

        modelBuilder.Entity<Payment>()
            .Property(p => p.Amount)
            .HasColumnType("numeric(10,2)");
    }
}