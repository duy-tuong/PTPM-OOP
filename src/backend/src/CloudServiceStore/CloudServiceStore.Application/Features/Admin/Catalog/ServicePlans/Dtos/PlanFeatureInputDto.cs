using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans.Dtos;

public class PlanFeatureInputDto
{
    [Required, MaxLength(100)]
    public string FeatureKey { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string FeatureLabel { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string FeatureValueText { get; set; } = string.Empty;

    public decimal? FeatureValueNumeric { get; set; }

    [MaxLength(20)]
    public string? FeatureUnit { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsHighlighted { get; set; }
}
