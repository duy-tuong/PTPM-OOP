using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans.Dtos;
using CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans;

public interface IAdminServicePlanService
{
    Task<PagedResult<AdminServicePlanDto>> GetListAsync(ServicePlanQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminServicePlanDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<AdminServicePlanDto> CreateAsync(CreateServicePlanDto dto, CancellationToken cancellationToken = default);

    Task<AdminServicePlanDto> UpdateAsync(int id, UpdateServicePlanDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
