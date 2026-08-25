using CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans.Dtos;

public class AdminServicePlanDto
{
    public int Id { get; init; }
    public int CategoryId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Sku { get; init; }
    public string? ShortDescription { get; init; }
    public string? Description { get; init; }
    public bool IsFeatured { get; init; }
    // string (không phải enum) - khớp convention response DTO khác (vd AdminOrderRequestDto.Status):
    // backend chưa có JsonStringEnumConverter toàn cục, request body (Create/UpdateServicePlanDto)
    // vẫn nhận enum thật (bind số nguyên), còn response trả sẵn tên chuỗi cho FE dùng trực tiếp.
    public string Status { get; init; } = string.Empty;
    public bool AllowGrandfatheredRenewal { get; init; }
    public bool AllowDowngrade { get; init; }
    public string? RegionId { get; init; }
    public string? RegionName { get; init; }
    // string (không phải enum) - cùng convention với Status ở trên.
    public string PackageType { get; init; } = string.Empty;
    public int? MinVcpu { get; init; }
    public int? MaxVcpu { get; init; }
    public int? StepVcpu { get; init; }
    public int? MinRamMb { get; init; }
    public int? MaxRamMb { get; init; }
    public int? StepRamMb { get; init; }
    public int? MinDiskGb { get; init; }
    public int? MaxDiskGb { get; init; }
    public int? StepDiskGb { get; init; }
    public decimal? PricePerVcpuPerMonth { get; init; }
    public decimal? PricePerRamGbPerMonth { get; init; }
    public decimal? PricePerDiskGbPerMonth { get; init; }
    public int DisplayOrder { get; init; }
    public string? QrCodeUrl { get; init; }
    public List<PlanFeatureDto> Features { get; init; } = new();
    public List<PlanPriceDto> Prices { get; init; } = new();
    public List<PlanAddonDto> Addons { get; init; } = new();
    public List<PlanOsImageDto> OsImages { get; init; } = new();
}
