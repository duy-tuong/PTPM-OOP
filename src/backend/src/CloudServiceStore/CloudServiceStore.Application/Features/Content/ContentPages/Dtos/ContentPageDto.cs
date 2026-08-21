namespace CloudServiceStore.Application.Features.Content.ContentPages.Dtos;

public class ContentPageDto
{
    public int Id { get; init; }
    public string Slug { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
    public string? MetaTitle { get; init; }
    public string? MetaDescription { get; init; }
    public DateTime? PublishedAt { get; init; }
}
