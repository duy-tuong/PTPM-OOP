using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Auth;
using CloudServiceStore.Application.Features.Auth.Dtos;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;
using Moq;

namespace CloudServiceStore.Tests.Features.Auth;

public class AuthServiceTests
{
    private readonly Mock<IPasswordHasher> _passwordHasherMock = new();
    private readonly Mock<IJwtTokenService> _jwtTokenServiceMock = new();

    public AuthServiceTests()
    {
        _jwtTokenServiceMock.SetupGet(j => j.AccessTokenLifetime).Returns(TimeSpan.FromMinutes(30));
        _jwtTokenServiceMock.SetupGet(j => j.RefreshTokenLifetime).Returns(TimeSpan.FromDays(7));
        _jwtTokenServiceMock.Setup(j => j.GenerateAccessToken(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<IEnumerable<string>>()))
            .Returns("fake-access-token");
        _jwtTokenServiceMock.Setup(j => j.GenerateRefreshToken()).Returns("fake-refresh-token");
    }

    // RoleId cố ý khác 1/2/3 để không đụng dữ liệu HasData (Admin/Editor/Customer) đã seed sẵn trong model.
    private static async Task<AppUser> SeedUserAsync(
        AppDbContext context,
        string username = "testuser",
        bool isActive = true,
        string? refreshToken = null,
        DateTime? refreshTokenExpiryTime = null)
    {
        var role = new AppRole { Id = 101, Name = "TestRole" };
        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Username = username,
            Email = $"{username}@example.com",
            PasswordHash = "stored-hash",
            FullName = "Test User",
            IsActive = isActive,
            RefreshToken = refreshToken,
            RefreshTokenExpiryTime = refreshTokenExpiryTime
        };
        user.UserRoles.Add(new AppUserRole { UserId = user.Id, User = user, RoleId = role.Id, Role = role });

        context.AppUsers.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsTokensAndUpdatesRefreshToken()
    {
        using var context = TestDbContextFactory.CreateContext();
        var user = await SeedUserAsync(context);
        _passwordHasherMock.Setup(p => p.Verify("correct-password", user.PasswordHash)).Returns(true);

        var sut = new AuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        var result = await sut.LoginAsync(new LoginRequest { UsernameOrEmail = user.Username, Password = "correct-password" });

        Assert.Equal("fake-access-token", result.AccessToken);
        Assert.Equal("fake-refresh-token", result.RefreshToken);
        Assert.Equal(["TestRole"], result.Roles);

        var persisted = context.AppUsers.Single(u => u.Id == user.Id);
        Assert.Equal("fake-refresh-token", persisted.RefreshToken);
        Assert.NotNull(persisted.RefreshTokenExpiryTime);
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ThrowsUnauthorizedAccessException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var user = await SeedUserAsync(context);
        _passwordHasherMock.Setup(p => p.Verify(It.IsAny<string>(), user.PasswordHash)).Returns(false);

        var sut = new AuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            sut.LoginAsync(new LoginRequest { UsernameOrEmail = user.Username, Password = "wrong-password" }));
    }

    [Fact]
    public async Task LoginAsync_UserNotFound_ThrowsUnauthorizedAccessException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = new AuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            sut.LoginAsync(new LoginRequest { UsernameOrEmail = "no-such-user", Password = "whatever" }));
    }

    [Fact]
    public async Task RefreshTokenAsync_ExpiredToken_ThrowsUnauthorizedAccessException()
    {
        using var context = TestDbContextFactory.CreateContext();
        await SeedUserAsync(context, refreshToken: "expired-token", refreshTokenExpiryTime: DateTime.UtcNow.AddDays(-1));

        var sut = new AuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            sut.RefreshTokenAsync(new RefreshTokenRequest { RefreshToken = "expired-token" }));
    }

    [Fact]
    public async Task RefreshTokenAsync_ValidToken_ReturnsNewTokens()
    {
        using var context = TestDbContextFactory.CreateContext();
        await SeedUserAsync(context, refreshToken: "valid-token", refreshTokenExpiryTime: DateTime.UtcNow.AddDays(1));

        var sut = new AuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        var result = await sut.RefreshTokenAsync(new RefreshTokenRequest { RefreshToken = "valid-token" });

        Assert.Equal("fake-access-token", result.AccessToken);
        Assert.Equal("fake-refresh-token", result.RefreshToken);
    }

    [Fact]
    public async Task ChangePasswordAsync_WrongCurrentPassword_ThrowsUnauthorizedAccessException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var user = await SeedUserAsync(context);
        _passwordHasherMock.Setup(p => p.Verify(It.IsAny<string>(), user.PasswordHash)).Returns(false);

        var sut = new AuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            sut.ChangePasswordAsync(user.Id, new ChangePasswordRequest { CurrentPassword = "wrong", NewPassword = "New@123" }));
    }

    [Fact]
    public async Task ChangePasswordAsync_Success_ClearsRefreshTokenAndUpdatesHash()
    {
        using var context = TestDbContextFactory.CreateContext();
        var user = await SeedUserAsync(context, refreshToken: "existing-token", refreshTokenExpiryTime: DateTime.UtcNow.AddDays(1));
        _passwordHasherMock.Setup(p => p.Verify("current-password", user.PasswordHash)).Returns(true);
        _passwordHasherMock.Setup(p => p.Hash("New@123")).Returns("new-hash");

        var sut = new AuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        await sut.ChangePasswordAsync(user.Id, new ChangePasswordRequest { CurrentPassword = "current-password", NewPassword = "New@123" });

        var persisted = context.AppUsers.Single(u => u.Id == user.Id);
        Assert.Equal("new-hash", persisted.PasswordHash);
        Assert.Null(persisted.RefreshToken);
        Assert.Null(persisted.RefreshTokenExpiryTime);
    }

    [Fact]
    public async Task LogoutAsync_UserNotFound_NoOp()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = new AuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        var exception = await Record.ExceptionAsync(() => sut.LogoutAsync(Guid.NewGuid()));

        Assert.Null(exception);
    }

    [Fact]
    public async Task LogoutAsync_UserFound_ClearsRefreshToken()
    {
        using var context = TestDbContextFactory.CreateContext();
        var user = await SeedUserAsync(context, refreshToken: "existing-token", refreshTokenExpiryTime: DateTime.UtcNow.AddDays(1));

        var sut = new AuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        await sut.LogoutAsync(user.Id);

        var persisted = context.AppUsers.Single(u => u.Id == user.Id);
        Assert.Null(persisted.RefreshToken);
        Assert.Null(persisted.RefreshTokenExpiryTime);
    }
}
