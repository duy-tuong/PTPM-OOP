using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;

public class ServicePlanQueryParams : PaginationParams
{
    public string? CategorySlug { get; set; }
    public bool? IsFeatured { get; set; }
}
