using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Sales.ConsultationRequests.Dtos;

public class ConsultationRequestQueryParams : PaginationParams
{
    // Tìm theo mã yêu cầu, tên hoặc email khách - dùng chung cho cả ô tìm kiếm riêng của trang này lẫn
    // link nhảy tới từ Tìm kiếm toàn cục (AdminSearchService).
    public string? Search { get; set; }
}
