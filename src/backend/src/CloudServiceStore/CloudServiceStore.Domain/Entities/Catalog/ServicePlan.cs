using CloudServiceStore.Domain.Common;

namespace CloudServiceStore.Domain.Entities.Catalog;

public class ServicePlan : ISoftDelete
{
    public int Id { get; set; }

    public int CategoryId { get; set; }
    public ServiceCategory Category { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
    public string? QrCodeUrl { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<PlanFeature> Features { get; set; } = new List<PlanFeature>();
    public ICollection<PlanPrice> Prices { get; set; } = new List<PlanPrice>();
}
