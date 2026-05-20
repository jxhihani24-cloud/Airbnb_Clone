namespace Hostera.Dtos;

public class CreateReviewRequest
{
    public Guid PropertyId { get; set; }

    public Guid UserId { get; set; }

    public int Rating { get; set; }

    public string Text { get; set; } = "";
}