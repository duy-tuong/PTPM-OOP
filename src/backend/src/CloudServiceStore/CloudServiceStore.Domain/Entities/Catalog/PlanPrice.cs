namespace CloudServiceStore.Domain.Entities.Catalog;

public class PlanPrice
{
    public int Id { get; set; }

    public int PlanId { get; set; }
    public ServicePlan Plan { get; set; } = null!;

    public int PeriodMonths { get; set; }
    public decimal Price { get; set; }
    public decimal? PromotionalPrice { get; set; }
    public string Currency { get; set; } = "VND";
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; } = true;

    // Price Versioning & Grandfathering: sửa giá cho 1 PeriodMonths đã có KHÔNG ghi đè row này - đóng
    // row (IsCurrent=false, EffectiveTo=now) rồi tạo row mới Version+1 (xem
    // AdminServicePlanService.UpdateAsync). Row cũ vẫn giữ trong DB (không xoá) để
    // OrderRequestItem.PlanPriceId của khách đã mua trước có thể tiếp tục trỏ tới khi gia hạn -
    // xem OrderRequestService.BuildServicePlanItemAsync.
    public int Version { get; set; } = 1;
    public bool IsCurrent { get; set; } = true;
    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
    public DateTime? EffectiveTo { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
