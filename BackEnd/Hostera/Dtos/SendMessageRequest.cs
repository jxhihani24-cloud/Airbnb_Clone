namespace Hostera.Dtos;

public class SendMessageRequest
{
    public Guid ConversationId { get; set; }

    public Guid SenderId { get; set; }

    public string Text { get; set; } = "";
}