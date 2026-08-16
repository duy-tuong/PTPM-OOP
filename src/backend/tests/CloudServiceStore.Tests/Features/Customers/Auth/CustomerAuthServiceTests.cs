using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Auth.Dtos;
using CloudServiceStore.Application.Features.Customers.Auth;
using CloudServiceStore.Application.Features.Customers.Auth.Dtos;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;
using Moq;

namespace CloudServiceStore.Tests.Features.Customers.Auth;

public class CustomerAuthServiceTests
{
    private readonly Mock<IPasswordHasher> _passwordHasherMock = new();
    private readonly Mock<IJwtTokenService> _jwtTokenServiceMock = new();

    public CustomerAuthServiceTests()
    {
        _jwtTokenServiceMock.SetupGet(j => j.AccessTokenLifetime).Returns(TimeSpan.FromMinutes(30));
        _jwtTokenServiceMock.SetupGet(j => j.RefreshTokenLifetime).Returns(TimeSpan.FromDays(7));
        _jwtTokenServiceMock.Setup(j => j.GenerateAccessToken(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<IEnumerable<string>>()))
            .Returns("fake-access-token");
        _jwtTokenServiceMock.Setup(j => j.GenerateRefreshToken()).Returns("fake-refresh-token");
    }

    // RoleId = 3 ("Customer") cố ý dùng đúng id thật đã seed sẵn qua AppRoleConfiguration.HasData -
    // ngược với AuthServiceTests (dùng id 101 để né 1/2/3), ở đây ta CẦN xác nhận đúng liên kết role thật.
    private static async Task<Customer> SeedCustomerAsync(
        AppDbContext context,
        string email = "customer@example.com",
        bool isActive = true,
        string? refreshToken = null,
        DateTime? refreshTokenExpiryTime = null)
    {
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = "stored-hash",
            FullName = "Test Customer",
            RoleId = 3,
            IsActive = isActive,
            RefreshToken = refreshToken,
            RefreshTokenExpiryTime = refreshTokenExpiryTime
        };

        context.Customers.Add(customer);
        await context.SaveChangesAsync();
        return customer;
    }

    [Fact]
    public async Task RegisterAsync_NewEmail_CreatesCustomerAndReturnsTokens()
    {
        using var context = TestDbContextFactory.CreateContext();
        _passwordHasherMock.Setup(p => p.Hash("Passw0rd!")).Returns("hashed-password");

        var sut = new CustomerAuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        var result = await sut.RegisterAsync(new CustomerRegisterRequest
        {
            FullName = "Nguyen Van A",
            Email = "a@example.com",
            Password = "Passw0rd!"
        });

        Assert.Equal("fake-access-token", result.AccessToken);
        Assert.Equal("fake-refresh-token", result.RefreshToken);
        Assert.Equal("Nguyen Van A", result.FullName);

        // Xác nhận customer thực sự được INSERT (test này sẽ fail nếu quay lại bug gọi repository.Update()
        // trên entity vừa AddAsync - state bị ghi đè Modified khiến EF sinh UPDATE thay vì INSERT).
        var persisted = context.Customers.Single(c => c.Email == "a@example.com");
        Assert.Equal("hashed-password", persisted.PasswordHash);
        Assert.Equal(3, persisted.RoleId);
        Assert.Equal("fake-refresh-token", persisted.RefreshToken);
        Assert.NotNull(persisted.RefreshTokenExpiryTime);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsConflictException()
    {
        using var context = TestDbContextFactory.CreateContext();
        await SeedCustomerAsync(context, email: "dup@example.com");

        var sut = new CustomerAuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        await Assert.ThrowsAsync<ConflictException>(() =>
            sut.RegisterAsync(new CustomerRegisterRequest { FullName = "B", Email = "dup@example.com", Password = "Passw0rd!" }));
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsTokensAndUpdatesRefreshToken()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context);
        _passwordHasherMock.Setup(p => p.Verify("correct-password", customer.PasswordHash)).Returns(true);

        var sut = new CustomerAuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        var result = await sut.LoginAsync(new CustomerLoginRequest { Email = customer.Email, Password = "correct-password" });

        Assert.Equal("fake-access-token", result.AccessToken);
        Assert.Equal("fake-refresh-token", result.RefreshToken);

        var persisted = context.Customers.Single(c => c.Id == customer.Id);
        Assert.Equal("fake-refresh-token", persisted.RefreshToken);
        Assert.NotNull(persisted.RefreshTokenExpiryTime);
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ThrowsUnauthorizedAccessException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context);
        _passwordHasherMock.Setup(p => p.Verify(It.IsAny<string>(), customer.PasswordHash)).Returns(false);

        var sut = new CustomerAuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            sut.LoginAsync(new CustomerLoginRequest { Email = customer.Email, Password = "wrong-password" }));
    }

    [Fact]
    public async Task LoginAsync_EmailNotFound_ThrowsUnauthorizedAccessException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = new CustomerAuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            sut.LoginAsync(new CustomerLoginRequest { Email = "no-such-customer@example.com", Password = "whatever" }));
    }

    [Fact]
    public async Task RefreshTokenAsync_ValidToken_ReturnsNewTokens()
    {
        using var context = TestDbContextFactory.CreateContext();
        await SeedCustomerAsync(context, refreshToken: "valid-token", refreshTokenExpiryTime: DateTime.UtcNow.AddDays(1));

        var sut = new CustomerAuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        var result = await sut.RefreshTokenAsync(new RefreshTokenRequest { RefreshToken = "valid-token" });

        Assert.Equal("fake-access-token", result.AccessToken);
        Assert.Equal("fake-refresh-token", result.RefreshToken);
    }

    [Fact]
    public async Task RefreshTokenAsync_ExpiredToken_ThrowsUnauthorizedAccessException()
    {
        using var context = TestDbContextFactory.CreateContext();
        await SeedCustomerAsync(context, refreshToken: "expired-token", refreshTokenExpiryTime: DateTime.UtcNow.AddDays(-1));

        var sut = new CustomerAuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            sut.RefreshTokenAsync(new RefreshTokenRequest { RefreshToken = "expired-token" }));
    }

    [Fact]
    public async Task LogoutAsync_CustomerFound_ClearsRefreshToken()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context, refreshToken: "existing-token", refreshTokenExpiryTime: DateTime.UtcNow.AddDays(1));

        var sut = new CustomerAuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        await sut.LogoutAsync(customer.Id);

        var persisted = context.Customers.Single(c => c.Id == customer.Id);
        Assert.Null(persisted.RefreshToken);
        Assert.Null(persisted.RefreshTokenExpiryTime);
    }

    [Fact]
    public async Task LogoutAsync_CustomerNotFound_NoOp()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = new CustomerAuthService(TestDbContextFactory.CreateUnitOfWork(context), _passwordHasherMock.Object, _jwtTokenServiceMock.Object);

        var exception = await Record.ExceptionAsync(() => sut.LogoutAsync(Guid.NewGuid()));

        Assert.Null(exception);
    }
}
