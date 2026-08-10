namespace CloudServiceStore.Application.Common.Interfaces;

public interface IJwtTokenService
{
    TimeSpan AccessTokenLifetime { get; }

    TimeSpan RefreshTokenLifetime { get; }

    string GenerateAccessToken(Guid userId, string username, string email, IEnumerable<string> roles);

    string GenerateRefreshToken();
}
