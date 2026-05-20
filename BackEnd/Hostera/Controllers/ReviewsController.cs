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
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewsController(AppDbContext context)
    {
        _context = context;
    }
    
    private Guid GetLoggedInUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [Authorize]
    [HttpPost("create")]
    public async Task<IActionResult> CreateReview(CreateReviewRequest request)
    {
        var userId = GetLoggedInUserId();

        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return BadRequest(new { message = "User not found" });
        }

        var property = await _context.Properties.FindAsync(request.PropertyId);

        if (property == null)
        {
            return BadRequest(new { message = "Property not found" });
        }

        if (request.Rating < 1 || request.Rating > 5)
        {
            return BadRequest(new { message = "Rating must be between 1 and 5" });
        }

        var review = new Review
        {
            Id = Guid.NewGuid(),
            PropertyId = request.PropertyId,
            UserId = userId,
            Rating = request.Rating,
            Text = request.Text
        };

        _context.Reviews.Add(review);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Review added successfully"
        });
    }

    [HttpGet("property/{propertyId}")]
    public async Task<IActionResult> GetPropertyReviews(Guid propertyId)
    {
        var reviews = await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.PropertyId == propertyId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Text,
                r.CreatedAt,
                UserName = r.User.FirstName + " " + r.User.LastName
            })
            .ToListAsync();

        return Ok(reviews);
    }
}