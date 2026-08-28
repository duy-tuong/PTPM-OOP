using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Catalog.TldPricings.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Catalog.TldPricings;

public interface IAdminTldPricingService
{
    Task<PagedResult<AdminTldPricingDto>> GetListAsync(TldPricingQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminTldPricingDto> CreateAsync(CreateTldPricingDto dto, CancellationToken cancellationToken = default);

    Task<AdminTldPricingDto> UpdateAsync(int id, UpdateTldPricingDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
