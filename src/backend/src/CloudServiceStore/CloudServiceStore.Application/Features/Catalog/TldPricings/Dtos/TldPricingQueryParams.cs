using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Catalog.TldPricings.Dtos;

public class TldPricingQueryParams : PaginationParams
{
    public string? CategorySlug { get; set; }
}
