using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CloudServiceStore.Infrastructure.Security;
using Microsoft.Extensions.Options;

namespace CloudServiceStore.Tests.Infrastructure.Security;

public class JwtTokenServiceTests
{
    private static JwtTokenService CreateSut(int accessTokenExpiryMinutes = 30)
    {
        var settings = new JwtSettings
        {
            Issuer = "CloudServiceStore",
            Audience = "CloudServiceStoreClient",
            SecretKey = "this-is-a-test-secret-key-at-least-32-bytes-long",
            AccessTokenExpiryMinutes = accessTokenExpiryMinutes,
            RefreshTokenExpiryDays = 7
        };
        return new JwtTokenService(Options.Create(settings));
    }

    [Fact]
    public void GenerateAccessToken_ContainsExpectedClaims_SubUsernameEmailAndRoles()
    {
        var sut = CreateSut();
        var userId = Guid.NewGuid();

        var token = sut.GenerateAccessToken(userId, "admin", "admin@cloudservicestore.local", ["Admin", "Editor"]);

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        Assert.Equal(userId.ToString(), jwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value);
        Assert.Equal("admin", jwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.UniqueName).Value);
        Assert.Equal("admin@cloudservicestore.local", jwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.Email).Value);
        var roles = jwt.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList();
        Assert.Equal(["Admin", "Editor"], roles);
    }

    [Fact]
    public void AccessTokenLifetime_ReflectsConfiguredExpiryMinutes()
    {
        var sut = CreateSut(accessTokenExpiryMinutes: 45);

        Assert.Equal(TimeSpan.FromMinutes(45), sut.AccessTokenLifetime);
    }

    [Fact]
    public void GenerateRefreshToken_ReturnsNonEmptyBase64String_DifferentEachCall()
    {
        var sut = CreateSut();

        var token1 = sut.GenerateRefreshToken();
        var token2 = sut.GenerateRefreshToken();

        Assert.NotEmpty(token1);
        Assert.NotEqual(token1, token2);
    }
}
