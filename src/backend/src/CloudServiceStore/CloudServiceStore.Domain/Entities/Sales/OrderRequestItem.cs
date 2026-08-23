using CloudServiceStore.Domain.Entities.Catalog;

namespace CloudServiceStore.Domain.Entities.Sales;

// 1 dòng sản phẩm trong giỏ hàng của OrderRequest - đúng 1 trong 2 (ServicePlanId hoặc TldPricingId),
// không bao giờ cả 2 hoặc không cái nào (validate ở OrderRequestService.CreateAsync). Tách ra bảng
// riêng thay vì field phẳng trên OrderRequest để 1 đơn hàng chứa được nhiều sản phẩm khác loại.
public class OrderRequestItem
{
    public int Id { get; set; }

    public int OrderRequestId { get; set; }
    public OrderRequest OrderRequest { get; set; } = null!;

    public int? ServicePlanId { get; set; }
    public ServicePlan? ServicePlan { get; set; }

    public int? TldPricingId { get; set; }
    public TldPricing? TldPricing { get; set; }
    public string? DomainName { get; set; }

    public int? PeriodMonths { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}
