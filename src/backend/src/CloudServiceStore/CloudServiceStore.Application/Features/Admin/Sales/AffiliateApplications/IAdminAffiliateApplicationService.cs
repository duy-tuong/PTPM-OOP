using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Sales.AffiliateApplications.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Sales.AffiliateApplications;

public interface IAdminAffiliateApplicationService
{
    Task<PagedResult<AdminAffiliateApplicationDto>> GetListAsync(AffiliateApplicationQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminAffiliateApplicationDto> UpdateStatusAsync(int id, UpdateAffiliateApplicationStatusDto dto, Guid changedByUserId, CancellationToken cancellationToken = default);
}
