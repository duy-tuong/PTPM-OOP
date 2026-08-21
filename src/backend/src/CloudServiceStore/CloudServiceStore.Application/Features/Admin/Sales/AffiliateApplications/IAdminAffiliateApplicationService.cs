using CloudServiceStore.Application.Features.Admin.Sales.AffiliateApplications.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Sales.AffiliateApplications;

public interface IAdminAffiliateApplicationService
{
    Task<List<AdminAffiliateApplicationDto>> GetListAsync(CancellationToken cancellationToken = default);

    Task<AdminAffiliateApplicationDto> UpdateStatusAsync(int id, UpdateAffiliateApplicationStatusDto dto, Guid changedByUserId, CancellationToken cancellationToken = default);
}
