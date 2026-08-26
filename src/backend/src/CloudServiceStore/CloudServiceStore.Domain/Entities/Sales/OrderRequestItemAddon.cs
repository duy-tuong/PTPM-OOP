using CloudServiceStore.Domain.Entities.Catalog;

namespace CloudServiceStore.Domain.Entities.Sales;

// Addon đã thực mua kèm 1 dòng OrderRequestItem (ServicePlan) - bảng riêng, KHÔNG tái dùng self-FK
// kiểu RenewsFromItemId trên OrderRequestItem (tránh 2 self-FK chồng chéo ngữ nghĩa trên cùng 1 bảng).
// UnitPrice/LineTotal snapshot tại thời điểm mua/gia hạn (đơn giá addon hiện hành, không grandfathering
// - xem OrderRequestService.BuildOrderItemAddonsAsync).
public class OrderRequestItemAddon
{
    public int Id { get; set; }

    public int OrderRequestItemId { get; set; }
    public OrderRequestItem OrderRequestItem { get; set; } = null!;

    public int AddonId { get; set; }
    public Addon Addon { get; set; } = null!;

    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}
