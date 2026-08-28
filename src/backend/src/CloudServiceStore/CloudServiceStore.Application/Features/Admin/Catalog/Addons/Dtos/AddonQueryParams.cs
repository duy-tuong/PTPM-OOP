using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Catalog.Addons.Dtos;

public class AddonQueryParams : PaginationParams
{
    // Tìm theo tên hoặc SKU của addon.
    public string? Search { get; set; }
}
