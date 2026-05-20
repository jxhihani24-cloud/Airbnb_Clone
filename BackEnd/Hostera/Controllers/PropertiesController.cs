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
public class PropertiesController : ControllerBase
{
    private readonly AppDbContext _context;

    public PropertiesController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetLoggedInUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
    
    [Authorize]
    [HttpPost("create")]
    public async Task<IActionResult> CreateProperty(CreatePropertyRequest request)
    {
        var owner = await _context.Users.FindAsync(GetLoggedInUserId());

        if (owner == null)
        {
            return BadRequest(new { message = "Owner not found" });
        }

        var property = new Property
        {
            Id = Guid.NewGuid(),
            OwnerId = GetLoggedInUserId(),
            Title = request.Title,
            City = request.City,
            Country = request.Country,
            PropertyType = request.PropertyType,
            Price = request.Price,
            Guests = request.Guests,
            Bedrooms = request.Bedrooms,
            Bathrooms = request.Bathrooms,
            Description = request.Description
        };

        for (int i = 0; i < request.Images.Count; i++)
        {
            property.Images.Add(new PropertyImage
            {
                Id = Guid.NewGuid(),
                PropertyId = property.Id,
                Url = request.Images[i],
                SortOrder = i
            });
        }

        _context.Properties.Add(property);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Property created successfully",
            propertyId = property.Id
        });
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllProperties()
    {
        var properties = await _context.Properties
            .Include(p => p.Owner)
            .Include(p => p.Images)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.City,
                p.Country,
                p.PropertyType,
                p.Price,
                p.Guests,
                p.Bedrooms,
                p.Bathrooms,
                p.Description,
                OwnerId = p.OwnerId,
                OwnerName = p.Owner.FirstName + " " + p.Owner.LastName,
                Images = p.Images
                    .OrderBy(i => i.SortOrder)
                    .Select(i => i.Url)
                    .ToList()
            })
            .ToListAsync();

        return Ok(properties);
    }

    [Authorize]
    [HttpGet("mine/{ownerId}")]
    public async Task<IActionResult> GetMyProperties(Guid ownerId)
    {
        var properties = await _context.Properties
            .Include(p => p.Images)
            .Where(p => p.OwnerId == ownerId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.City,
                p.Country,
                p.PropertyType,
                p.Price,
                p.Guests,
                p.Bedrooms,
                p.Bathrooms,
                p.Description,
                Images = p.Images
                    .OrderBy(i => i.SortOrder)
                    .Select(i => i.Url)
                    .ToList()
            })
            .ToListAsync();

        return Ok(properties);
    }
    
    [Authorize]
    [HttpDelete("delete/{propertyId}")]
    public async Task<IActionResult> DeleteProperty(Guid propertyId)
    {
        var property = await _context.Properties
            .Include(p => p.Images)
            .Include(p => p.Bookings)
            .FirstOrDefaultAsync(p => p.Id == propertyId);

        if (property == null)
        {
            return BadRequest(new { message = "Property not found" });
        }
        if (property.OwnerId != GetLoggedInUserId())
        {
            return Forbid();
        }

        _context.Properties.Remove(property);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Property deleted successfully"
        });
    }
    
    [Authorize]
    [HttpPut("update/{propertyId}")]
    public async Task<IActionResult> UpdateProperty(
        Guid propertyId,
        CreatePropertyRequest request)
    {
        var property = await _context.Properties
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == propertyId);

        if (property == null)
        {
            return BadRequest(new { message = "Property not found" });
        }
        
        if (property.OwnerId != GetLoggedInUserId())
        {
            return Forbid();
        }

        property.Title = request.Title;
        property.City = request.City;
        property.Country = request.Country;
        property.PropertyType = request.PropertyType;
        property.Price = request.Price;
        property.Guests = request.Guests;
        property.Bedrooms = request.Bedrooms;
        property.Bathrooms = request.Bathrooms;
        property.Description = request.Description;

        _context.PropertyImages.RemoveRange(property.Images);

        property.Images.Clear();

        for (int i = 0; i < request.Images.Count; i++)
        {
            property.Images.Add(new PropertyImage
            {
                Id = Guid.NewGuid(),
                PropertyId = property.Id,
                Url = request.Images[i],
                SortOrder = i
            });
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Property updated successfully"
        });
    }
    
    [HttpGet("{propertyId}")]
    public async Task<IActionResult> GetPropertyById(Guid propertyId)
    {
        var property = await _context.Properties
            .Include(p => p.Owner)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == propertyId);

        if (property == null)
        {
            return BadRequest(new { message = "Property not found" });
        }

        return Ok(new
        {
            property.Id,
            property.OwnerId,
            property.Title,
            property.City,
            property.Country,
            property.PropertyType,
            property.Price,
            property.Guests,
            property.Bedrooms,
            property.Bathrooms,
            property.Description,
            OwnerName = property.Owner.FirstName + " " + property.Owner.LastName,
            Images = property.Images
                .OrderBy(i => i.SortOrder)
                .Select(i => i.Url)
                .ToList()
        });
    }
    
    
}