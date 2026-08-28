using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Identity.Users.Dtos;

public class UserQueryParams : PaginationParams
{
    // Tìm theo tên đăng nhập, email hoặc họ tên - dùng chung cho cả ô tìm kiếm riêng của trang này lẫn
    // link nhảy tới từ Tìm kiếm toàn cục (AdminSearchService).
    public string? Search { get; set; }
}
