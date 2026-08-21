using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities.Marketing;

public class PromotionScope
{
    public int Id { get; set; }

    public int PromotionId { get; set; }
    public Promotion Promotion { get; set; } = null!;

    public ScopeType ScopeType { get; set; }

    public int? ServiceCategoryId { get; set; }
    public ServiceCategory? ServiceCategory { get; set; }

    public int? ServicePlanId { get; set; }
    public ServicePlan? ServicePlan { get; set; }
}
