using CloudServiceStore.Domain.Common;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities.Catalog;

public class ServicePlan : ISoftDelete
{
    public int Id { get; set; }

    public int CategoryId { get; set; }
    public ServiceCategory Category { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    // Mã tra cứu nội bộ (support/đối soát) - tách biệt Slug (định danh cho URL), không bắt buộc.
    public string? Sku { get; set; }
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public bool IsFeatured { get; set; }
    public ServicePlanStatus Status { get; set; } = ServicePlanStatus.Active;
    public int DisplayOrder { get; set; }
    public string? QrCodeUrl { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<PlanFeature> Features { get; set; } = new List<PlanFeature>();
    public ICollection<PlanPrice> Prices { get; set; } = new List<PlanPrice>();
}
