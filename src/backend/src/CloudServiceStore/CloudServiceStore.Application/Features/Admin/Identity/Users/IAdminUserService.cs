using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Identity.Users.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Identity.Users;

public interface IAdminUserService
{
    Task<PagedResult<AdminUserDto>> GetListAsync(UserQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminUserDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default);

    Task<AdminUserDto> UpdateAsync(Guid id, UpdateUserDto dto, Guid changedByUserId, CancellationToken cancellationToken = default);

    Task ResetPasswordAsync(Guid id, ResetUserPasswordDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, Guid changedByUserId, CancellationToken cancellationToken = default);
}
