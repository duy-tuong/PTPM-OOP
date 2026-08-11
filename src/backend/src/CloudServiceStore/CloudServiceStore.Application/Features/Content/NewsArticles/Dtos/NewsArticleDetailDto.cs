namespace CloudServiceStore.Application.Features.Content.NewsArticles.Dtos;

public class NewsArticleDetailDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Summary { get; init; }
    public string Content { get; init; } = string.Empty;
    public string? ThumbnailUrl { get; init; }
    public DateTime PublishedAt { get; init; }
    public int ViewCount { get; init; }
    public string CategoryName { get; init; } = string.Empty;
    public string CategorySlug { get; init; } = string.Empty;
    public List<string> Tags { get; init; } = new();
}
