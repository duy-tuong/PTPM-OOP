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
}
