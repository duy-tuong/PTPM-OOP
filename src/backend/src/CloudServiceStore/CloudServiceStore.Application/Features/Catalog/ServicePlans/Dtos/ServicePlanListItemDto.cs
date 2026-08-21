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
    public decimal? StartingPrice { get; init; }
    public List<PlanFeatureDto> Features { get; init; } = [];
    public List<PlanPriceDto> Prices { get; init; } = [];
}
