using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Admin.Sales.OrderRequests.Dtos;

public class OrderRequestQueryParams : PaginationParams
{
    public OrderRequestStatus? Status { get; set; }

    // Fraud Review (Đợt 2, Phần 9) - lọc "chỉ đơn nghi vấn" trên bảng Admin. true = chỉ đơn bị gắn cờ,
    // null/false = không lọc theo cờ này (hiện tất cả).
    public bool? FlaggedOnly { get; set; }

    // Tìm theo mã đơn hoặc tên/email khách hàng - dùng chung cho cả ô tìm kiếm riêng của trang này lẫn
    // link nhảy tới từ Tìm kiếm toàn cục (AdminSearchService) khi khách bấm 1 kết quả Đơn hàng.
    public string? Search { get; set; }
}
