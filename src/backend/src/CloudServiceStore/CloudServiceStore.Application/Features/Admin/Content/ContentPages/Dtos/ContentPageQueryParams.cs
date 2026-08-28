using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Content.ContentPages.Dtos;

public class ContentPageQueryParams : PaginationParams
{
    // Tìm theo tiêu đề hoặc slug trang nội dung.
    public string? Search { get; set; }
}
