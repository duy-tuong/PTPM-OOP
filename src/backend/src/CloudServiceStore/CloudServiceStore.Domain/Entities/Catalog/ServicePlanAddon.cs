namespace CloudServiceStore.Domain.Entities.Catalog;

// Bảng nối N-N: Addon nào được phép mua kèm ServicePlan nào, giới hạn số lượng tối đa. Composite key
// (PlanId, AddonId) - xem ServicePlanAddonConfiguration.cs. Không tự nó có giá riêng - giá luôn đọc
// trực tiếp từ Addon.PricePerMonth tại thời điểm mua (không grandfathering, xem Addon.cs).
public class ServicePlanAddon
{
    public int PlanId { get; set; }
    public ServicePlan Plan { get; set; } = null!;

    public int AddonId { get; set; }
    public Addon Addon { get; set; } = null!;

    public int MaxQuantity { get; set; } = 1;
}
