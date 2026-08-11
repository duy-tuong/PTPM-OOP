using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Catalog.TldPricings.Dtos;

namespace CloudServiceStore.Application.Features.Catalog.TldPricings;

public interface ITldPricingService
{
    Task<PagedResult<TldPricingDto>> GetListAsync(TldPricingQueryParams query, CancellationToken cancellationToken = default);
}
