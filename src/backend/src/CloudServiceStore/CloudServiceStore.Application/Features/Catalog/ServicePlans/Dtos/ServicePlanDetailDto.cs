namespace CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;

public class ServicePlanDetailDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? ShortDescription { get; init; }
    public string? Description { get; init; }
    public bool IsFeatured { get; init; }
    public string? QrCodeUrl { get; init; }
    public string CategoryName { get; init; } = string.Empty;
    public string CategorySlug { get; init; } = string.Empty;
    public string? RegionName { get; init; }
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
    public List<PlanFeatureDto> Features { get; init; } = new();
    public List<PlanPriceDto> Prices { get; init; } = new();
    public List<PlanAddonDto> Addons { get; init; } = new();
}
