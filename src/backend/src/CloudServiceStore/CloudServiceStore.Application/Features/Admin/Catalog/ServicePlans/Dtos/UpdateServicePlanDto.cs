using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans.Dtos;

public class UpdateServicePlanDto
{
    [Required]
    public int CategoryId { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ShortDescription { get; set; }

    public string? Description { get; set; }

    public bool IsFeatured { get; set; }

    public bool IsActive { get; set; }

    public int DisplayOrder { get; set; }

    public List<PlanFeatureInputDto> Features { get; set; } = new();

    public List<PlanPriceInputDto> Prices { get; set; } = new();
}
