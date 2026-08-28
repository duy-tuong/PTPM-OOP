using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Marketing.Promotions.Dtos;

public class PromotionQueryParams : PaginationParams
{
    // Tìm theo mã hoặc tên khuyến mãi - dùng chung cho cả ô tìm kiếm riêng của trang này lẫn link nhảy
    // tới từ Tìm kiếm toàn cục (AdminSearchService).
    public string? Search { get; set; }
}
