using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans.Dtos;

public class PlanOsImageInputDto
{
    [Required]
    public int OsImageId { get; set; }

    public bool IsDefault { get; set; }
}
