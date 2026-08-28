using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Identity.Users.Dtos;
using CloudServiceStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Identity.Users;

public class AdminUserService : IAdminUserService
{
    // Chỉ Admin/Editor được phép gán qua AppUser - RoleId=3 (Customer) thuộc bảng Customer hoàn toàn
    // riêng biệt, không liên quan tới AppUser/AppUserRole.
    private static readonly int[] AllowedRoleIds = { 1, 2 };

    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;

    public AdminUserService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
    }

    public async Task<PagedResult<AdminUserDto>> GetListAsync(UserQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<AppUser, Guid>();

        var baseQuery = repository.Query()
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .OrderBy(u => u.Username);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(MapToDto).ToList();
        return PagedResult<AdminUserDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<AdminUserDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<AppUser, Guid>();

        ValidateRoleIds(dto.RoleIds);
        await EnsureUsernameAndEmailAreUniqueAsync(repository, dto.Username, dto.Email, excludeId: null, cancellationToken);

        var entity = new AppUser
        {
            Username = dto.Username,
            Email = dto.Email,
            FullName = dto.FullName,
            PhoneNumber = dto.PhoneNumber,
            PasswordHash = _passwordHasher.Hash(dto.Password),
            IsActive = true
        };
        entity.UserRoles = dto.RoleIds.Select(roleId => new AppUserRole { UserId = entity.Id, RoleId = roleId }).ToList();

        await repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetByIdWithRolesAsync(repository, entity.Id, cancellationToken);
    }

    public async Task<AdminUserDto> UpdateAsync(Guid id, UpdateUserDto dto, Guid changedByUserId, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<AppUser, Guid>();

        if (id == changedByUserId && !dto.IsActive)
        {
            throw new ConflictException("Không thể tự khoá tài khoản của chính mình.");
        }

        ValidateRoleIds(dto.RoleIds);

        var entity = await repository.Query()
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(AppUser), id);
        }

        await EnsureUsernameAndEmailAreUniqueAsync(repository, entity.Username, dto.Email, excludeId: id, cancellationToken);

        entity.FullName = dto.FullName;
        entity.Email = dto.Email;
        entity.PhoneNumber = dto.PhoneNumber;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        entity.UserRoles.Clear();
        foreach (var roleId in dto.RoleIds)
        {
            entity.UserRoles.Add(new AppUserRole { UserId = entity.Id, RoleId = roleId });
        }

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetByIdWithRolesAsync(repository, entity.Id, cancellationToken);
    }

    public async Task ResetPasswordAsync(Guid id, ResetUserPasswordDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<AppUser, Guid>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(AppUser), id);
        }

        entity.PasswordHash = _passwordHasher.Hash(dto.NewPassword);
        entity.UpdatedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, Guid changedByUserId, CancellationToken cancellationToken = default)
    {
        if (id == changedByUserId)
        {
            throw new ConflictException("Không thể tự xoá tài khoản của chính mình.");
        }

        var repository = _unitOfWork.Repository<AppUser, Guid>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(AppUser), id);
        }

        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static void ValidateRoleIds(List<int> roleIds)
    {
        if (roleIds.Count == 0 || roleIds.Any(id => !AllowedRoleIds.Contains(id)))
        {
            throw new ValidationException("Vui lòng chọn ít nhất 1 vai trò hợp lệ (Admin/Editor).");
        }
    }

    private static async Task EnsureUsernameAndEmailAreUniqueAsync(
        IRepository<AppUser, Guid> repository,
        string username,
        string email,
        Guid? excludeId,
        CancellationToken cancellationToken)
    {
        var usernameTaken = await repository.Query()
            .AnyAsync(u => u.Username == username && (excludeId == null || u.Id != excludeId), cancellationToken);
        if (usernameTaken)
        {
            throw new ConflictException($"Tên đăng nhập '{username}' đã tồn tại.");
        }

        var emailTaken = await repository.Query()
            .AnyAsync(u => u.Email == email && (excludeId == null || u.Id != excludeId), cancellationToken);
        if (emailTaken)
        {
            throw new ConflictException($"Email '{email}' đã tồn tại.");
        }
    }

    private static async Task<AdminUserDto> GetByIdWithRolesAsync(IRepository<AppUser, Guid> repository, Guid id, CancellationToken cancellationToken)
    {
        var entity = await repository.Query()
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstAsync(u => u.Id == id, cancellationToken);

        return MapToDto(entity);
    }

    private static AdminUserDto MapToDto(AppUser user)
    {
        return new AdminUserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            IsActive = user.IsActive,
            Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList(),
            CreatedAt = user.CreatedAt
        };
    }
}
