using CloudServiceStore.Domain.Common;

namespace CloudServiceStore.Domain.Entities.Content;

public class NewsCategory : ISoftDelete
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    public ICollection<NewsArticle> Articles { get; set; } = new List<NewsArticle>();
}
