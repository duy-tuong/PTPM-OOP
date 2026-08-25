namespace CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;

public class ServicePlanListItemDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? ShortDescription { get; init; }
    public bool IsFeatured { get; init; }
    public string? QrCodeUrl { get; init; }
    public string CategoryName { get; init; } = string.Empty;
    public string CategorySlug { get; init; } = string.Empty;
    public string? RegionName { get; init; }
    public decimal? StartingPrice { get; init; }
    // string (không phải enum) - cùng convention response DTO khác. "Fixed"/"Custom" - client (Next.js)
    // dựa vào field này để quyết định hiện khối chọn giá cố định hay thanh trượt cấu hình.
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
    public List<PlanFeatureDto> Features { get; init; } = [];
    public List<PlanPriceDto> Prices { get; init; } = [];
    public List<PlanAddonDto> Addons { get; init; } = [];
    public List<PlanOsImageDto> OsImages { get; init; } = [];
}
