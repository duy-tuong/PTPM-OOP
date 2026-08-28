using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Sales.AffiliateApplications.Dtos;

public class AffiliateApplicationQueryParams : PaginationParams
{
    // Tìm theo họ tên, email hoặc số điện thoại người đăng ký affiliate.
    public string? Search { get; set; }
}
