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

    // Neo đúng row PlanPrice đã dùng lúc tạo item này (Price Versioning) - phục vụ Grandfathering khi
    // gia hạn (chỉ có ý nghĩa với item ServicePlan, null với item TLD). Xem
    // OrderRequestService.BuildServicePlanItemAsync.
    public int? PlanPriceId { get; set; }
    public PlanPrice? PlanPrice { get; set; }

    public int? PeriodMonths { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }

    // Snapshot cấu hình khách chọn lúc mua từ gói Custom (ServicePlan.PackageType = Custom) - chỉ có
    // giá trị với item ServicePlan dạng Custom, null với Fixed/TLD. Không đổi được sau này dù Admin có
    // sửa Min/Max/Step của plan - xem OrderRequestService.BuildServicePlanItemAsync.
    public int? ChosenVcpu { get; set; }
    public int? ChosenRamMb { get; set; }
    public int? ChosenDiskGb { get; set; }

    // Thông tin bàn giao mô phỏng (Tier 3 - "cấp phát tự động") - do OrderRequestStatusTransitionService
    // sinh khi đơn chuyển Completed, KHÔNG phải hạ tầng thật. ServicePlan-item nhận IP+mật khẩu root,
    // TldPricing-item nhận nameserver. Tất cả null cho tới khi Completed.
    public string? ProvisionedIpAddress { get; set; }
    public string? ProvisionedRootPassword { get; set; }
    public string? ProvisionedNameservers { get; set; }
    public DateTime? ProvisionedAt { get; set; }

    // Tier 4 "vòng đời gia hạn" - ExpiresAt chỉ có ý nghĩa trên item "đang sống" (RenewsFromItemId ==
    // null), set lúc Completed (xem OrderRequestStatusTransitionService). RenewsFromItemId chỉ set
    // trên ĐÚNG 1 item của 1 đơn GIA HẠN (self-referencing FK trỏ về item gốc cần gia hạn) - item gia
    // hạn tự nó không có ExpiresAt riêng (không có vòng đời độc lập, chỉ có tác dụng cộng dồn thời hạn
    // vào item gốc). RenewalReminderSentAt là cờ chống gửi trùng email nhắc, chỉ có ý nghĩa khi
    // RenewsFromItemId == null.
    public DateTime? ExpiresAt { get; set; }
    public int? RenewsFromItemId { get; set; }
    public OrderRequestItem? RenewsFromItem { get; set; }
    public DateTime? RenewalReminderSentAt { get; set; }

    // Đổi gói (Upgrade/Downgrade + Proration) - self-referencing FK, mirror RenewsFromItemId nhưng
    // mang ý nghĩa khác: item này (ServicePlanId/PlanPriceId = gói ĐÍCH, UnitPrice/LineTotal = số tiền
    // phụ thu proration - KHÔNG phải giá đầy đủ của gói đích) khi đơn của nó Completed thì áp dụng đổi
    // gói lên item GỐC (ChangesFromItemId trỏ tới) - chỉ đổi ServicePlanId/PlanPriceId/UnitPrice/
    // LineTotal, GIỮ NGUYÊN ExpiresAt (không dời hạn, không cấp phát lại) - xem
    // OrderRequestStatusTransitionService.ApplyCompletionEffectsAsync + PlanChangeService.
    public int? ChangesFromItemId { get; set; }
    public OrderRequestItem? ChangesFromItem { get; set; }

    // Addon mua kèm dòng này (chỉ có ý nghĩa với item ServicePlan) - xem OrderRequestItemAddon.cs.
    public ICollection<OrderRequestItemAddon> Addons { get; set; } = new List<OrderRequestItemAddon>();

    // Dunning Automation - chỉ có ý nghĩa trên item "đang sống" (RenewsFromItemId == null, mirror
    // RenewalReminderSentAt), suy ra trạng thái vòng đời từ đúng 3 mốc này + ExpiresAt (không thêm enum
    // Status riêng để tránh state machine trùng lặp) - xem DunningPolicy.ComputeLifecycleStatus.
    // Reset về null khi gia hạn/đổi gói thành công (OrderRequestStatusTransitionService.
    // ApplyCompletionEffectsAsync) - khách đã trả tiền thì khôi phục dịch vụ.
    public DateTime? SuspendedAt { get; set; }
    public DateTime? TerminationWarningSentAt { get; set; }
    public DateTime? TerminatedAt { get; set; }

    // Hệ điều hành đã chọn lúc mua (Đợt 3, Phần 11) - chỉ có ý nghĩa với item ServicePlan mua MỚI
    // (null với TLD và với item "biên lai" gia hạn/đổi gói). OsImageName snapshot tại thời điểm mua vì
    // Admin có thể đổi tên/xoá OsImage sau này. OsLicenseFee snapshot đúng số tiền phụ phí bản quyền
    // Windows ĐÃ cộng vào UnitPrice lúc mua (không tính lại) - null nếu chọn OS Linux hoặc không chọn OS.
    public int? OsImageId { get; set; }
    public OsImage? OsImage { get; set; }
    public string? OsImageName { get; set; }
    public decimal? OsLicenseFee { get; set; }

    // SSH Key & Metadata bàn giao (Đợt 3, Phần 12) - chỉ có ý nghĩa với item ServicePlan mua MỚI (null
    // với TLD và với item "biên lai" gia hạn/đổi gói - gia hạn copy trực tiếp SshPublicKeySnapshot từ
    // item gốc, không tra cứu lại theo Id, xem OrderRequestService.CreateRenewalAsync).
    // SshPublicKeySnapshot: nội dung key ĐÃ dùng lúc mua, snapshot từ CustomerSshKey - khách xoá key
    // khỏi tài khoản sau này không ảnh hưởng đơn đã tạo. null nghĩa là dùng mật khẩu root giả lập
    // (xem IFakeProvisioningGenerator.GenerateServerCredentials).
    public string? SshPublicKeySnapshot { get; set; }
    public string? Hostname { get; set; }
    // Chuỗi tự do phân tách dấu phẩy, chỉ mang tính hiển thị - không có bảng Tag riêng, không có logic
    // nghiệp vụ nào phụ thuộc.
    public string? Tags { get; set; }
}
