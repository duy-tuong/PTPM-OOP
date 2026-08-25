using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities.Catalog;

// Tiện ích mua kèm (IP phụ, Block Storage, Backup, License...) - độc lập với ServicePlan, gắn vào 1
// hoặc nhiều plan qua ServicePlanAddon. KHÔNG áp Price Versioning đầy đủ như PlanPrice (chỉ IsActive
// bool) - rủi ro tranh chấp giá thấp hơn plan chính, giữ đơn giản để không phình phạm vi.
public class Addon
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public AddonType Type { get; set; }
    public AddonBillingType BillingType { get; set; }
    // Chỉ có ý nghĩa hiển thị khi BillingType = PerUnit (vd "GB", "IP") - PricePerMonth vẫn luôn là
    // đơn giá/1 đơn vị/tháng cho cả 2 loại billing (xem OrderRequestService.BuildOrderItemAddonsAsync).
    public string? UnitName { get; set; }
    public decimal PricePerMonth { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<ServicePlanAddon> PlanAddons { get; set; } = new List<ServicePlanAddon>();
}
