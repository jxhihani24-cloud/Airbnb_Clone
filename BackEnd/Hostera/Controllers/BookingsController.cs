using Hostera.Data;
using Hostera.Dtos;
using Hostera.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Hostera.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BookingsController(AppDbContext context)
    {
        _context = context;
    }
    
    private Guid GetLoggedInUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [Authorize]
    [HttpPost("create")]
    public async Task<IActionResult> CreateBooking(CreateBookingRequest request)
    {
        var userId = GetLoggedInUserId();

        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return BadRequest(new { message = "User not found" });
        }

        var property = await _context.Properties
            .Include(p => p.Owner)
            .FirstOrDefaultAsync(p => p.Id == request.PropertyId);

        if (property == null)
        {
            return BadRequest(new { message = "Property not found" });
        }

        if (request.CheckOutDate <= request.CheckInDate)
        {
            return BadRequest(new { message = "Check-out date must be after check-in date" });
        }

        var alreadyBooked = await _context.Bookings.AnyAsync(b =>
            b.PropertyId == request.PropertyId &&
            request.CheckInDate < b.CheckOutDate &&
            request.CheckOutDate > b.CheckInDate &&
            b.Status != "Cancelled"
        );

        if (alreadyBooked)
        {
            return BadRequest(new { message = "This property is already booked for those dates" });
        }

        int nights = request.CheckOutDate.DayNumber - request.CheckInDate.DayNumber;

        decimal subtotal = property.Price * nights;

        decimal serviceFee = Math.Round(subtotal * 0.10m, 2);

        decimal total = subtotal + serviceFee;

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PropertyId = request.PropertyId,
            CheckInDate = request.CheckInDate,
            CheckOutDate = request.CheckOutDate,
            Guests = request.Guests,
            PricePerNight = property.Price,
            TotalAmount = total,
            Status = "Confirmed"
        };

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            BookingId = booking.Id,
            Method = request.PaymentMethod,
            Status = request.PaymentMethod.ToLower() == "cash" ? "Pending" : "Completed",
            Amount = total
        };

        _context.Bookings.Add(booking);
        _context.Payments.Add(payment);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Booking created successfully",
            bookingId = booking.Id,
            total
        });
    }
    
    [Authorize]
    [HttpGet("mine/{userId}")]
    public async Task<IActionResult> GetMyBookings(Guid userId)
    {
        if (userId != GetLoggedInUserId())
        {
            return Forbid();
        }

        var bookings = await _context.Bookings
            .Include(b => b.Property)
            .ThenInclude(p => p.Images)
            .Include(b => b.Property)
            .ThenInclude(p => p.Owner)
            .Include(b => b.Payment)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new
            {
                b.Id,
                b.PropertyId,
                PropertyTitle = b.Property.Title,
                b.Property.City,
                b.Property.Country,
                Image = b.Property.Images
                    .OrderBy(i => i.SortOrder)
                    .Select(i => i.Url)
                    .FirstOrDefault(),
                b.CheckInDate,
                b.CheckOutDate,
                b.Guests,
                b.PricePerNight,
                b.TotalAmount,
                b.Status,
                HostName = b.Property.Owner.FirstName + " " + b.Property.Owner.LastName,
                PaymentMethod = b.Payment != null ? b.Payment.Method : "",
                PaymentStatus = b.Payment != null ? b.Payment.Status : ""
            })
            .ToListAsync();

        return Ok(bookings);
    }
    
    [Authorize]
    [HttpDelete("cancel/{bookingId}")]
    public async Task<IActionResult> CancelBooking(Guid bookingId)
    {
        var userId = GetLoggedInUserId();

        var booking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
        {
            return BadRequest(new { message = "Booking not found" });
        }

        if (booking.UserId != userId)
        {
            return Forbid();
        }

        if (booking.CheckInDate <= DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)))
        {
            return BadRequest(new
            {
                message = "Cannot cancel within 7 days of check-in"
            });
        }

        booking.Status = "Cancelled";

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Booking cancelled successfully"
        });
    }
}