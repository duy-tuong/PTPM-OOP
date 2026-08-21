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
    public List<PlanFeatureDto> Features { get; init; } = new();
    public List<PlanPriceDto> Prices { get; init; } = new();
}
