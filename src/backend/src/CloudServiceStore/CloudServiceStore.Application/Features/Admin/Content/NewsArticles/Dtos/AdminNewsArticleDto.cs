namespace CloudServiceStore.Application.Features.Admin.Content.NewsArticles.Dtos;

public class AdminNewsArticleDto
{
    public int Id { get; init; }
    public int NewsCategoryId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Summary { get; init; }
    public string Content { get; init; } = string.Empty;
    public string? ThumbnailUrl { get; init; }
    public bool IsPublished { get; init; }
    public bool IsFeatured { get; init; }
    public DateTime PublishedAt { get; init; }
    public int ViewCount { get; init; }
    public Guid AuthorId { get; init; }
    public List<string> Tags { get; init; } = new();
}
