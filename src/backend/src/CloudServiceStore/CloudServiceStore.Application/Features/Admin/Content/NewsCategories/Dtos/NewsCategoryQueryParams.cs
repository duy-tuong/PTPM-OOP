using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Content.NewsCategories.Dtos;

public class NewsCategoryQueryParams : PaginationParams
{
    // Tìm theo tên hoặc slug danh mục tin tức.
    public string? Search { get; set; }
}
