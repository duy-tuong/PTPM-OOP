using CloudServiceStore.Domain.Common;
using CloudServiceStore.Domain.Entities.Identity;

namespace CloudServiceStore.Domain.Entities.Content;

public class ContentPage : ISoftDelete
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }

    public Guid AuthorId { get; set; }
    public AppUser Author { get; set; } = null!;

    public bool IsPublished { get; set; } = true;
    public DateTime? PublishedAt { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
