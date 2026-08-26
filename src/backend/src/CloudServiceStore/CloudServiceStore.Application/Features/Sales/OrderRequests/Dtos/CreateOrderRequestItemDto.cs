using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

public class CreateOrderRequestItemDto
{
    public int? ServicePlanId { get; set; }

    public int? TldPricingId { get; set; }

    [MaxLength(100)]
    public string? DomainName { get; set; }

    public int? PeriodMonths { get; set; }

    [Range(1, 100)]
    public int Quantity { get; set; } = 1;

    // Chỉ có ý nghĩa khi ServicePlanId có giá trị - xem OrderRequestService.BuildOrderItemAddonsAsync.
    public List<AddonSelectionDto> Addons { get; set; } = new();

    // Bắt buộc khi ServicePlanId trỏ tới gói Custom (PackageType = Custom), bỏ qua với gói Fixed - xem
    // OrderRequestService.BuildServicePlanItemAsync.
    public int? ChosenVcpu { get; set; }
    public int? ChosenRamMb { get; set; }
    public int? ChosenDiskGb { get; set; }

    // Hệ điều hành đã chọn (Đợt 3, Phần 11) - chỉ có ý nghĩa khi ServicePlanId có giá trị. Tuỳ chọn -
    // để trống nếu plan không cấu hình OS nào hoặc khách không cần chọn - xem
    // OrderRequestService.ResolveOsImageAsync.
    public int? OsImageId { get; set; }

    // Xác thực & bàn giao (Đợt 3, Phần 12) - đều tuỳ chọn, chỉ có ý nghĩa khi ServicePlanId có giá trị.
    // SshPublicKeyId: key đã lưu trong tài khoản (xem CustomerSshKeyService) - để trống thì dùng mật
    // khẩu root giả lập như hành vi cũ.
    public int? SshPublicKeyId { get; set; }
    [MaxLength(100)]
    public string? Hostname { get; set; }
    [MaxLength(255)]
    public string? Tags { get; set; }
}
