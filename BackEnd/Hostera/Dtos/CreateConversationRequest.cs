namespace Hostera.Dtos;

public class CreateConversationRequest
{
    public Guid UserId { get; set; }

    public Guid PropertyId { get; set; }
}