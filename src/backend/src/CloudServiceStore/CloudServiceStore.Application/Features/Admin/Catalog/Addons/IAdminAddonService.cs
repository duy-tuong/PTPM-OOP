using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Catalog.Addons.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Catalog.Addons;

public interface IAdminAddonService
{
    Task<PagedResult<AdminAddonDto>> GetListAsync(AddonQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminAddonDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<AdminAddonDto> CreateAsync(CreateAddonDto dto, CancellationToken cancellationToken = default);

    Task<AdminAddonDto> UpdateAsync(int id, UpdateAddonDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
