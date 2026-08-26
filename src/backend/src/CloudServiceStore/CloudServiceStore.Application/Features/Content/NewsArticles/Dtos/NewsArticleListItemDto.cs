namespace CloudServiceStore.Application.Features.Content.NewsArticles.Dtos;

public class NewsArticleListItemDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Summary { get; init; }
    public string? ThumbnailUrl { get; init; }
    public DateTime PublishedAt { get; init; }
    public int ViewCount { get; init; }
    public bool IsFeatured { get; init; }
    public string AuthorName { get; init; } = string.Empty;
    // Số từ trong Content - dùng để tính "X phút đọc" ở frontend (lib/utils.ts estimateReadingMinutes),
    // không lộ toàn bộ Content trong DTO danh sách.
    public int WordCount { get; init; }
    public string CategoryName { get; init; } = string.Empty;
    public string CategorySlug { get; init; } = string.Empty;
    public List<string> Tags { get; init; } = new();
}
