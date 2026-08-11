using CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Catalog.ServicePlans;

public interface IAdminServicePlanService
{
    Task<AdminServicePlanDto> CreateAsync(CreateServicePlanDto dto, CancellationToken cancellationToken = default);

    Task<AdminServicePlanDto> UpdateAsync(int id, UpdateServicePlanDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
