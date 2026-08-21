using CloudServiceStore.Domain.Common;
using CloudServiceStore.Domain.Entities.Identity;

namespace CloudServiceStore.Domain.Entities.Content;

public class NewsArticle : ISoftDelete
{
    public int Id { get; set; }

    public Guid AuthorId { get; set; }
    public AppUser Author { get; set; } = null!;

    public int NewsCategoryId { get; set; }
    public NewsCategory NewsCategory { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public int ViewCount { get; set; }
    public bool IsPublished { get; set; } = true;
    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<NewsArticleTag> ArticleTags { get; set; } = new List<NewsArticleTag>();
    public ICollection<NewsComment> Comments { get; set; } = new List<NewsComment>();
}
