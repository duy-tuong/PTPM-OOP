using CloudServiceStore.Application.Features.Sales.AffiliateApplications.Dtos;

namespace CloudServiceStore.Application.Features.Sales.AffiliateApplications;

public interface IAffiliateApplicationService
{
    Task<AffiliateApplicationDto> CreateAsync(CreateAffiliateApplicationDto dto, CancellationToken cancellationToken = default);
}
