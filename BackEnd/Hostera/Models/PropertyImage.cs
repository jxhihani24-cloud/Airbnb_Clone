namespace Hostera.Models;

public class PropertyImage
{
    public Guid Id { get; set; }

    public Guid PropertyId { get; set; }
    public Property Property { get; set; } = null!;

    public string Url { get; set; } = "";

    public int SortOrder { get; set; }
}