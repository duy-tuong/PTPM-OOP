using CloudServiceStore.Domain.Common;
using CloudServiceStore.Domain.Entities.Identity;

namespace CloudServiceStore.Domain.Entities.Content;

public class Testimonial : ISoftDelete
{
    public int Id { get; set; }

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public string DisplayName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? AvatarUrl { get; set; }
    public string Content { get; set; } = string.Empty;
    public int? Rating { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
