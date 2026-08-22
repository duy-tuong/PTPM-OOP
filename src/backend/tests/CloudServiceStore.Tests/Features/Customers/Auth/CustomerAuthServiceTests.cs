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
    private readonly Mock<IEmailService> _emailServiceMock = new();
    private readonly Mock<IAppSettings> _appSettingsMock = new();

    public CustomerAuthServiceTests()
    {
        _jwtTokenServiceMock.SetupGet(j => j.AccessTokenLifetime).Returns(TimeSpan.FromMinutes(30));
        _jwtTokenServiceMock.SetupGet(j => j.RefreshTokenLifetime).Returns(TimeSpan.FromDays(7));
        _jwtTokenServiceMock.Setup(j => j.GenerateAccessToken(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<IEnumerable<string>>()))
            .Returns("fake-access-token");
        _jwtTokenServiceMock.Setup(j => j.GenerateRefreshToken()).Returns("fake-refresh-token");
        _appSettingsMock.SetupGet(a => a.PublicBaseUrl).Returns("http://localhost:3000");
    }

    private CustomerAuthService CreateSut(AppDbContext context) => new(
        TestDbContextFactory.CreateUnitOfWork(context),
        _passwordHasherMock.Object,
        _jwtTokenServiceMock.Object,
        _emailServiceMock.Object,
        _appSettingsMock.Object);

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

        var sut = CreateSut(context);

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

        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ConflictException>(() =>
            sut.RegisterAsync(new CustomerRegisterRequest { FullName = "B", Email = "dup@example.com", Password = "Passw0rd!" }));
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsTokensAndUpdatesRefreshToken()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context);
        _passwordHasherMock.Setup(p => p.Verify("correct-password", customer.PasswordHash)).Returns(true);

        var sut = CreateSut(context);

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

        var sut = CreateSut(context);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            sut.LoginAsync(new CustomerLoginRequest { Email = customer.Email, Password = "wrong-password" }));
    }

    [Fact]
    public async Task LoginAsync_EmailNotFound_ThrowsUnauthorizedAccessException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            sut.LoginAsync(new CustomerLoginRequest { Email = "no-such-customer@example.com", Password = "whatever" }));
    }

    [Fact]
    public async Task RefreshTokenAsync_ValidToken_ReturnsNewTokens()
    {
        using var context = TestDbContextFactory.CreateContext();
        await SeedCustomerAsync(context, refreshToken: "valid-token", refreshTokenExpiryTime: DateTime.UtcNow.AddDays(1));

        var sut = CreateSut(context);

        var result = await sut.RefreshTokenAsync(new RefreshTokenRequest { RefreshToken = "valid-token" });

        Assert.Equal("fake-access-token", result.AccessToken);
        Assert.Equal("fake-refresh-token", result.RefreshToken);
    }

    [Fact]
    public async Task RefreshTokenAsync_ExpiredToken_ThrowsUnauthorizedAccessException()
    {
        using var context = TestDbContextFactory.CreateContext();
        await SeedCustomerAsync(context, refreshToken: "expired-token", refreshTokenExpiryTime: DateTime.UtcNow.AddDays(-1));

        var sut = CreateSut(context);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            sut.RefreshTokenAsync(new RefreshTokenRequest { RefreshToken = "expired-token" }));
    }

    [Fact]
    public async Task LogoutAsync_CustomerFound_ClearsRefreshToken()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context, refreshToken: "existing-token", refreshTokenExpiryTime: DateTime.UtcNow.AddDays(1));

        var sut = CreateSut(context);

        await sut.LogoutAsync(customer.Id);

        var persisted = context.Customers.Single(c => c.Id == customer.Id);
        Assert.Null(persisted.RefreshToken);
        Assert.Null(persisted.RefreshTokenExpiryTime);
    }

    [Fact]
    public async Task LogoutAsync_CustomerNotFound_NoOp()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        var exception = await Record.ExceptionAsync(() => sut.LogoutAsync(Guid.NewGuid()));

        Assert.Null(exception);
    }

    [Fact]
    public async Task RequestEmailChangeAsync_NewEmailAvailable_SetsPendingEmailAndSendsEmail()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context);
        var sut = CreateSut(context);

        await sut.RequestEmailChangeAsync(customer.Id, new RequestEmailChangeDto { NewEmail = "new@example.com" });

        var persisted = context.Customers.Single(c => c.Id == customer.Id);
        Assert.Equal("new@example.com", persisted.PendingEmail);
        Assert.Equal("fake-refresh-token", persisted.EmailVerificationToken);
        Assert.NotNull(persisted.EmailVerificationExpiry);
        _emailServiceMock.Verify(e => e.SendAsync("new@example.com", It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task RequestEmailChangeAsync_EmailAlreadyUsedByAnotherCustomer_ThrowsConflictException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context, email: "customer@example.com");
        await SeedCustomerAsync(context, email: "taken@example.com");
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ConflictException>(() =>
            sut.RequestEmailChangeAsync(customer.Id, new RequestEmailChangeDto { NewEmail = "taken@example.com" }));
    }

    [Fact]
    public async Task ConfirmEmailChangeAsync_ValidToken_UpdatesEmailClearsTokenSetsVerified()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context);
        customer.PendingEmail = "new@example.com";
        customer.EmailVerificationToken = "valid-token";
        customer.EmailVerificationExpiry = DateTime.UtcNow.AddHours(1);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        await sut.ConfirmEmailChangeAsync("valid-token");

        var persisted = context.Customers.Single(c => c.Id == customer.Id);
        Assert.Equal("new@example.com", persisted.Email);
        Assert.Null(persisted.PendingEmail);
        Assert.True(persisted.IsEmailVerified);
        Assert.Null(persisted.EmailVerificationToken);
        Assert.Null(persisted.EmailVerificationExpiry);
    }

    [Fact]
    public async Task ConfirmEmailChangeAsync_ExpiredToken_ThrowsUnauthorizedAccessException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context);
        customer.PendingEmail = "new@example.com";
        customer.EmailVerificationToken = "expired-token";
        customer.EmailVerificationExpiry = DateTime.UtcNow.AddHours(-1);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => sut.ConfirmEmailChangeAsync("expired-token"));
    }

    [Fact]
    public async Task ConfirmEmailChangeAsync_InvalidToken_ThrowsUnauthorizedAccessException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => sut.ConfirmEmailChangeAsync("no-such-token"));
    }

    [Fact]
    public async Task ForgotPasswordAsync_ExistingEmail_SetsResetTokenAndSendsEmail()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context);
        var sut = CreateSut(context);

        await sut.ForgotPasswordAsync(new ForgotPasswordRequest { Email = customer.Email });

        var persisted = context.Customers.Single(c => c.Id == customer.Id);
        Assert.Equal("fake-refresh-token", persisted.PasswordResetToken);
        Assert.NotNull(persisted.PasswordResetExpiry);
        _emailServiceMock.Verify(e => e.SendAsync(customer.Email, It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ForgotPasswordAsync_NonExistentEmail_DoesNotThrowAndDoesNotSendEmail()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        var exception = await Record.ExceptionAsync(() =>
            sut.ForgotPasswordAsync(new ForgotPasswordRequest { Email = "no-such-customer@example.com" }));

        Assert.Null(exception);
        _emailServiceMock.Verify(e => e.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ResetPasswordAsync_ValidToken_UpdatesPasswordAndClearsToken()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context, refreshToken: "old-refresh", refreshTokenExpiryTime: DateTime.UtcNow.AddDays(1));
        customer.PasswordResetToken = "valid-reset-token";
        customer.PasswordResetExpiry = DateTime.UtcNow.AddHours(1);
        await context.SaveChangesAsync();
        _passwordHasherMock.Setup(p => p.Hash("NewPassw0rd!")).Returns("new-hashed-password");
        var sut = CreateSut(context);

        await sut.ResetPasswordAsync(new ResetPasswordRequest { Token = "valid-reset-token", NewPassword = "NewPassw0rd!" });

        var persisted = context.Customers.Single(c => c.Id == customer.Id);
        Assert.Equal("new-hashed-password", persisted.PasswordHash);
        Assert.Null(persisted.PasswordResetToken);
        Assert.Null(persisted.PasswordResetExpiry);
        Assert.Null(persisted.RefreshToken);
        Assert.Null(persisted.RefreshTokenExpiryTime);
    }

    [Fact]
    public async Task ResetPasswordAsync_ExpiredToken_ThrowsUnauthorizedAccessException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context);
        customer.PasswordResetToken = "expired-reset-token";
        customer.PasswordResetExpiry = DateTime.UtcNow.AddHours(-1);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            sut.ResetPasswordAsync(new ResetPasswordRequest { Token = "expired-reset-token", NewPassword = "whatever" }));
    }
}
