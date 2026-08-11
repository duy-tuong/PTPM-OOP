using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;

namespace CloudServiceStore.Application.Features.Catalog.ServicePlans;

public interface IServicePlanService
{
    Task<PagedResult<ServicePlanListItemDto>> GetListAsync(ServicePlanQueryParams query, CancellationToken cancellationToken = default);

    Task<ServicePlanDetailDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
}
