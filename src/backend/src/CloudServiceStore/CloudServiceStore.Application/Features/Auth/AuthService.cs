using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Auth.Dtos;
using CloudServiceStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Auth;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, IJwtTokenService jwtTokenService)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<AppUser, Guid>();

        var user = await repository.Query()
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(
                u => u.IsActive && (u.Username == request.UsernameOrEmail || u.Email == request.UsernameOrEmail),
                cancellationToken);

        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Sai tên đăng nhập hoặc mật khẩu.");
        }

        return await IssueTokensAsync(user, repository, cancellationToken);
    }

    public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<AppUser, Guid>();

        var user = await repository.Query()
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(
                u => u.RefreshToken == request.RefreshToken
                     && u.RefreshTokenExpiryTime.HasValue
                     && u.RefreshTokenExpiryTime.Value > DateTime.UtcNow,
                cancellationToken);

        if (user is null)
        {
            throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");
        }

        return await IssueTokensAsync(user, repository, cancellationToken);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<AppUser, Guid>();

        var user = await repository.GetByIdAsync(userId, cancellationToken)
            ?? throw new UnauthorizedAccessException("Người dùng không tồn tại.");

        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Mật khẩu hiện tại không đúng.");
        }

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        // Buộc đăng nhập lại ở mọi thiết bị sau khi đổi mật khẩu.
        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;
        user.UpdatedAt = DateTime.UtcNow;

        repository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task LogoutAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<AppUser, Guid>();

        var user = await repository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return;
        }

        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;

        repository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<LoginResponse> IssueTokensAsync(
        AppUser user,
        IRepository<AppUser, Guid> repository,
        CancellationToken cancellationToken)
    {
        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToArray();

        var accessToken = _jwtTokenService.GenerateAccessToken(user.Id, user.Username, user.Email, roles);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.Add(_jwtTokenService.RefreshTokenLifetime);
        user.UpdatedAt = DateTime.UtcNow;

        repository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAtUtc = DateTime.UtcNow.Add(_jwtTokenService.AccessTokenLifetime),
            FullName = user.FullName,
            Roles = roles
        };
    }
}
