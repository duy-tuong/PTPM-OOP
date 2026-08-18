using CloudServiceStore.Application.Features.Admin.Identity.Users.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Identity.Users;

public interface IAdminUserService
{
    Task<List<AdminUserDto>> GetListAsync(CancellationToken cancellationToken = default);

    Task<AdminUserDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default);

    Task<AdminUserDto> UpdateAsync(Guid id, UpdateUserDto dto, Guid changedByUserId, CancellationToken cancellationToken = default);

    Task ResetPasswordAsync(Guid id, ResetUserPasswordDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, Guid changedByUserId, CancellationToken cancellationToken = default);
}
