namespace CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;

public class PlanFeatureDto
{
    public string FeatureKey { get; init; } = string.Empty;
    public string FeatureLabel { get; init; } = string.Empty;
    public string FeatureValueText { get; init; } = string.Empty;
    public decimal? FeatureValueNumeric { get; init; }
    public string? FeatureUnit { get; init; }
    public bool IsHighlighted { get; init; }
}
