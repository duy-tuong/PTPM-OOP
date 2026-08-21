namespace CloudServiceStore.Domain.Entities.Catalog;

public class PlanFeature
{
    public int Id { get; set; }

    public int PlanId { get; set; }
    public ServicePlan Plan { get; set; } = null!;

    public string FeatureKey { get; set; } = string.Empty;
    public string FeatureLabel { get; set; } = string.Empty;
    public string FeatureValueText { get; set; } = string.Empty;
    public decimal? FeatureValueNumeric { get; set; }
    public string? FeatureUnit { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsHighlighted { get; set; }
}
