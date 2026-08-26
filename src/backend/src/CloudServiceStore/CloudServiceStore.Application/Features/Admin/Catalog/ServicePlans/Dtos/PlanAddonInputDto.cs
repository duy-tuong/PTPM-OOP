using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans.Dtos;

public class PlanAddonInputDto
{
    [Required]
    public int AddonId { get; set; }

    [Range(1, 999)]
    public int MaxQuantity { get; set; } = 1;
}
