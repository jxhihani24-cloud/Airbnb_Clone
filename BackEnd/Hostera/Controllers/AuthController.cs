using BCrypt.Net;
using Hostera.Data;
using Hostera.Dtos;
using Hostera.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hostera.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Hostera.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;

    public AuthController(AppDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }
    
    private Guid GetLoggedInUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var usernameExists = await _context.Users
            .AnyAsync(u => u.Username == request.Username);

        if (usernameExists)
        {
            return BadRequest(new
            {
                message = "Username already exists"
            });
        }

        var emailExists = await _context.Users
            .AnyAsync(u => u.Email == request.Email);

        if (emailExists)
        {
            return BadRequest(new
            {
                message = "Email already exists"
            });
        }

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            Id = Guid.NewGuid(),

            FirstName = request.FirstName,
            LastName = request.LastName,

            Username = request.Username,
            Email = request.Email,

            PasswordHash = hashedPassword,

            Gender = request.Gender,
            DateOfBirth = request.DateOfBirth,
            Country = request.Country,
            PhoneNumber = request.PhoneNumber
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();
        var token = _tokenService.CreateToken(user);
        return Ok(new
        {
            message = "User registered successfully", token,
            user = new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Username,
                user.Email
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null)
        {
            return BadRequest(new
            {
                message = "Invalid username or password"
            });
        }

        var validPassword = BCrypt.Net.BCrypt.Verify(
            request.Password,
            user.PasswordHash
        );

        if (!validPassword)
        {
            return BadRequest(new
            {
                message = "Invalid username or password"
            });
        }
        var token = _tokenService.CreateToken(user);
        return Ok(new
        {
            message = "Login successful", token, user = new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Username,
                user.Email
            }
        });
    }
    
    [Authorize]
    [HttpPut("update/{userId}")]
    public async Task<IActionResult> UpdateUser(Guid userId, UpdateAccountRequest request)
    {
        if (userId != GetLoggedInUserId())
        {
            return Forbid();
        }
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return BadRequest(new { message = "User not found" });
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Username = request.Username;
        user.Email = request.Email;
        user.Gender = request.Gender;
        user.Country = request.Country;
        user.PhoneNumber = request.PhoneNumber;

        if (request.DateOfBirth.HasValue)
        {
            user.DateOfBirth = request.DateOfBirth.Value;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Account updated successfully",

            user = new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Username,
                user.Email,
                user.Gender,
                user.DateOfBirth,
                user.Country,
                user.PhoneNumber
            }
        });
    }
    
    [Authorize]
    [HttpDelete("delete/{userId}")]
    public async Task<IActionResult> DeleteUser(Guid userId)
    {
        if (userId != GetLoggedInUserId())
        {
            return Forbid();
        }
        
        var user = await _context.Users
            .Include(u => u.Properties)
            .Include(u => u.Bookings)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return BadRequest(new { message = "User not found" });
        }

        _context.Users.Remove(user);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Account deleted successfully"
        });
    }
}