using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Content.Partners.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Content.Partners;

public interface IAdminPartnerService
{
    Task<PagedResult<AdminPartnerDto>> GetListAsync(PartnerQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminPartnerDto> CreateAsync(CreatePartnerDto dto, CancellationToken cancellationToken = default);

    Task<AdminPartnerDto> UpdateAsync(int id, UpdatePartnerDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
