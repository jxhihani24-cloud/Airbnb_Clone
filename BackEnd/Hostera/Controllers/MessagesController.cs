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
public class MessagesController : ControllerBase
{
    private readonly AppDbContext _context;

    public MessagesController(AppDbContext context)
    {
        _context = context;
    }
    
    private Guid GetLoggedInUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [Authorize]
    [HttpPost("conversation/create")]
    public async Task<IActionResult> CreateConversation(CreateConversationRequest request)
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

        var existingConversation = await _context.Conversations
            .FirstOrDefaultAsync(c =>
                c.UserId == userId &&
                c.PropertyId == request.PropertyId);

        if (existingConversation != null)
        {
            return Ok(new
            {
                conversationId = existingConversation.Id
            });
        }

        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PropertyId = request.PropertyId
        };

        _context.Conversations.Add(conversation);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            conversationId = conversation.Id
        });
    }

    [Authorize]
    [HttpPost("send")]
    public async Task<IActionResult> SendMessage(SendMessageRequest request)
    {
        var conversation = await _context.Conversations
            .FirstOrDefaultAsync(c => c.Id == request.ConversationId);

        if (conversation == null)
        {
            return BadRequest(new { message = "Conversation not found" });
        }
        
        if (conversation.UserId != GetLoggedInUserId())
        {
            return Forbid();
        }

        var sender = await _context.Users.FindAsync(request.SenderId);

        if (sender == null)
        {
            return BadRequest(new { message = "Sender not found" });
        }

        var message = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = request.ConversationId,
            SenderId = request.SenderId,
            Text = request.Text
        };

        _context.Messages.Add(message);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Message sent successfully"
        });
    }

    [Authorize]
    [HttpGet("conversation/{conversationId}")]
    public async Task<IActionResult> GetConversation(Guid conversationId)
    {
       
        var conversation = await _context.Conversations
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (conversation == null)
        {
            return BadRequest(new { message = "Conversation not found" });
        }

        if (conversation.UserId != GetLoggedInUserId())
        {
            return Forbid();
        }
        
        var messages = await _context.Messages
            .Include(m => m.Sender)
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new
            {
                m.Id,
                m.Text,
                m.CreatedAt,
                SenderId = m.SenderId,
                SenderName = m.Sender.FirstName + " " + m.Sender.LastName
            })
            .ToListAsync();

        return Ok(messages);
    }

    [Authorize]
    [HttpGet("mine/{userId}")]
    public async Task<IActionResult> GetMyConversations(Guid userId)
    {
        if (userId != GetLoggedInUserId())
        {
            return Forbid();
        }
        var conversations = await _context.Conversations
            .Include(c => c.Property)
            .ThenInclude(p => p.Images)
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                PropertyId = c.PropertyId,
                PropertyTitle = c.Property.Title,
                Image = c.Property.Images
                    .OrderBy(i => i.SortOrder)
                    .Select(i => i.Url)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(conversations);
    }
}