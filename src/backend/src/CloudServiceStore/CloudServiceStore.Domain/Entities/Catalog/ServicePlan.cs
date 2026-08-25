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
    // Khách gia hạn cùng chu kỳ có được giữ giá cũ (Grandfathering) hay luôn tính theo giá sống hiện
    // hành - xem OrderRequestService.CreateRenewalAsync. Mặc định true (đúng kỳ vọng khách hàng thật:
    // giữ giá đã cam kết khi mua, tránh tranh chấp khi Admin tăng giá - xem PDF "3 mắt xích").
    public bool AllowGrandfatheredRenewal { get; set; } = true;
    // Đổi gói (PlanChangeService) - khách được phép HẠ CẤP xuống gói này hay không. Nâng cấp lên gói
    // này luôn được phép (nếu Status=Active) - cờ này chỉ chặn chiều hạ cấp, tránh Admin bị mất doanh
    // thu ngoài ý muốn khi khách chủ động hạ xuống gói rẻ hơn. Mặc định true (cho phép).
    public bool AllowDowngrade { get; set; } = true;
    // Datacenter/Region hiển thị - thuần trang trí (xem Region.cs), không ảnh hưởng giá/tồn kho.
    public string? RegionId { get; set; }
    public Region? Region { get; set; }

    // Fixed = giá cố định theo PlanPrice.Price như hiện tại. Custom = khách tự kéo thanh trượt
    // vCPU/RAM/Disk trong khoảng Min/Max/Step dưới đây, giá tính theo đơn giá/đơn vị (xem
    // OrderRequestService.BuildServicePlanItemAsync). Các field Min/Max/Step/PricePerUnit chỉ có ý
    // nghĩa khi PackageType = Custom - null hết khi Fixed.
    public ServicePlanPackageType PackageType { get; set; } = ServicePlanPackageType.Fixed;
    public int? MinVcpu { get; set; }
    public int? MaxVcpu { get; set; }
    public int? StepVcpu { get; set; }
    public int? MinRamMb { get; set; }
    public int? MaxRamMb { get; set; }
    public int? StepRamMb { get; set; }
    public int? MinDiskGb { get; set; }
    public int? MaxDiskGb { get; set; }
    public int? StepDiskGb { get; set; }
    public decimal? PricePerVcpuPerMonth { get; set; }
    public decimal? PricePerRamGbPerMonth { get; set; }
    public decimal? PricePerDiskGbPerMonth { get; set; }

    public int DisplayOrder { get; set; }
    public string? QrCodeUrl { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<PlanFeature> Features { get; set; } = new List<PlanFeature>();
    public ICollection<PlanPrice> Prices { get; set; } = new List<PlanPrice>();
    public ICollection<ServicePlanAddon> PlanAddons { get; set; } = new List<ServicePlanAddon>();
}
