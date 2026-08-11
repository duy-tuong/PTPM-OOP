using CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans.Dtos;

public class AdminServicePlanDto
{
    public int Id { get; init; }
    public int CategoryId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? ShortDescription { get; init; }
    public string? Description { get; init; }
    public bool IsFeatured { get; init; }
    public bool IsActive { get; init; }
    public int DisplayOrder { get; init; }
    public string? QrCodeUrl { get; init; }
    public List<PlanFeatureDto> Features { get; init; } = new();
    public List<PlanPriceDto> Prices { get; init; } = new();
}
