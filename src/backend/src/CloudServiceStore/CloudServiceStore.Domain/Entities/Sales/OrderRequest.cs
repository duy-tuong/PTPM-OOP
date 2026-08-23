using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Entities.Marketing;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities.Sales;

public class OrderRequest
{
    public int Id { get; set; }
    public string OrderCode { get; set; } = string.Empty;

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public CustomerType CustomerType { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? TaxCode { get; set; }

    public int? PromotionId { get; set; }
    public Promotion? Promotion { get; set; }

    public decimal TotalPrice { get; set; }
    public string? Note { get; set; }
    public OrderRequestStatus Status { get; set; } = OrderRequestStatus.New;

    public Guid? AssignedToUserId { get; set; }
    public AppUser? AssignedToUser { get; set; }

    public string? Source { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Thời điểm gần nhất đơn VÀO trạng thái Paid/Provisioning - dùng riêng cho
    // OrderAutoProvisioningBackgroundService tính đã tới lúc tự chuyển bước tiếp theo chưa. Cố tình
    // KHÔNG dùng chung UpdatedAt (field đó có thể bị đổi bởi các thao tác khác không phải chuyển trạng
    // thái trong tương lai, làm sai lệch mốc thời gian đếm giờ tự động).
    public DateTime? PaidAt { get; set; }
    public DateTime? ProvisioningStartedAt { get; set; }

    // Giỏ hàng nhiều sản phẩm - 1 đơn có thể gồm nhiều dòng gói dịch vụ/tên miền trộn lẫn.
    public ICollection<OrderRequestItem> Items { get; set; } = new List<OrderRequestItem>();
}
