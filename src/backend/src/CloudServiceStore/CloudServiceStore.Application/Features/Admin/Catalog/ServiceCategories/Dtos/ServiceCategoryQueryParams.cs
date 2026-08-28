using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Catalog.ServiceCategories.Dtos;

public class ServiceCategoryQueryParams : PaginationParams
{
    // Tìm theo tên hoặc slug danh mục dịch vụ.
    public string? Search { get; set; }
}
