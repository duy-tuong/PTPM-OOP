using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Catalog.TldPricings.Dtos;

public class TldPricingQueryParams : PaginationParams
{
    // Tìm theo đuôi tên miền (vd ".com", ".vn").
    public string? Search { get; set; }
}
