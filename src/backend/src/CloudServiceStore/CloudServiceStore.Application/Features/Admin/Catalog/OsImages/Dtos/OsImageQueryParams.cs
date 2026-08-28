using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Catalog.OsImages.Dtos;

public class OsImageQueryParams : PaginationParams
{
    // Tìm theo tên hoặc slug hệ điều hành.
    public string? Search { get; set; }
}
