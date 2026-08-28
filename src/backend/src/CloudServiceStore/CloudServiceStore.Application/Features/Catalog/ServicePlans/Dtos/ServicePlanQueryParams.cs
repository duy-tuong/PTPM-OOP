using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;

public class ServicePlanQueryParams : PaginationParams
{
    public string? CategorySlug { get; set; }
    public bool? IsFeatured { get; set; }

    // Chỉ có ý nghĩa ở AdminServicePlanService (lọc theo trạng thái vòng đời) - ServicePlanService
    // (public) luôn ép cứng Active, bỏ qua field này.
    public ServicePlanStatus? Status { get; set; }

    // Region thuần trang trí (xem Region.cs) - dùng ở cả 2 bên (Admin lọc quản lý, storefront lọc
    // theo Datacenter khách muốn xem).
    public string? RegionId { get; set; }

    // Tìm theo tên, slug hoặc SKU gói dịch vụ - chỉ AdminServicePlanService dùng (trang quản lý), public
    // ServicePlanService bỏ qua field này.
    public string? Search { get; set; }
}
