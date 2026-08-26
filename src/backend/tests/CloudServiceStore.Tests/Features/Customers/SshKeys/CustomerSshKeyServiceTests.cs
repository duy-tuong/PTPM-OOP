using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Features.Customers.SshKeys;
using CloudServiceStore.Application.Features.Customers.SshKeys.Dtos;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;

namespace CloudServiceStore.Tests.Features.Customers.SshKeys;

public class CustomerSshKeyServiceTests
{
    private static CustomerSshKeyService CreateSut(AppDbContext context) =>
        new(TestDbContextFactory.CreateUnitOfWork(context));

    // Id/role cố ý khác dữ liệu HasData - test không phụ thuộc InMemory provider có tự nạp seed hay không.
    private static async Task<Customer> SeedCustomerAsync(AppDbContext context, int roleId, string email = "sshkey-customer@example.com")
    {
        context.AppRoles.Add(new AppRole { Id = roleId, Name = $"Test Role {roleId}", Description = "Test" });
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            RoleId = roleId,
            Email = email,
            PasswordHash = "hash",
            FullName = "SSH Key Customer",
            Phone = "0900000077",
            CustomerType = CustomerType.Individual,
        };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();
        return customer;
    }

    private const string ValidEd25519Key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBWc user@laptop";
    private const string ValidRsaKey = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7 user@desktop";

    [Fact]
    public async Task CreateAsync_ValidEd25519Key_CreatesKey()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context, roleId: 951);
        var sut = CreateSut(context);

        var result = await sut.CreateAsync(customer.Id, new CreateSshKeyDto { Label = "Laptop", PublicKey = ValidEd25519Key });

        Assert.Equal("Laptop", result.Label);
        Assert.Equal(ValidEd25519Key, result.PublicKey);
    }

    [Fact]
    public async Task CreateAsync_ValidRsaKey_CreatesKey()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context, roleId: 952);
        var sut = CreateSut(context);

        var result = await sut.CreateAsync(customer.Id, new CreateSshKeyDto { Label = "Desktop", PublicKey = ValidRsaKey });

        Assert.Equal(ValidRsaKey, result.PublicKey);
    }

    [Theory]
    [InlineData("not-a-real-key")]
    [InlineData("ssh-rsa")]
    [InlineData("")]
    [InlineData("dsa-key AAAAB3NzaC1")]
    public async Task CreateAsync_InvalidFormat_ThrowsValidationException(string malformedKey)
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context, roleId: 953);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() =>
            sut.CreateAsync(customer.Id, new CreateSshKeyDto { Label = "Bad", PublicKey = malformedKey }));
    }

    [Fact]
    public async Task GetMineAsync_ReturnsOnlyOwnKeys()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customerA = await SeedCustomerAsync(context, roleId: 954, email: "a@example.com");
        var customerB = await SeedCustomerAsync(context, roleId: 955, email: "b@example.com");
        var sut = CreateSut(context);
        await sut.CreateAsync(customerA.Id, new CreateSshKeyDto { Label = "A-Key", PublicKey = ValidEd25519Key });
        await sut.CreateAsync(customerB.Id, new CreateSshKeyDto { Label = "B-Key", PublicKey = ValidRsaKey });

        var result = await sut.GetMineAsync(customerA.Id);

        var key = Assert.Single(result);
        Assert.Equal("A-Key", key.Label);
    }

    [Fact]
    public async Task DeleteAsync_OwnKey_RemovesKey()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context, roleId: 956);
        var sut = CreateSut(context);
        var created = await sut.CreateAsync(customer.Id, new CreateSshKeyDto { Label = "ToDelete", PublicKey = ValidEd25519Key });

        await sut.DeleteAsync(customer.Id, created.Id);

        var remaining = await sut.GetMineAsync(customer.Id);
        Assert.Empty(remaining);
    }

    [Fact]
    public async Task DeleteAsync_KeyBelongsToDifferentCustomer_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var owner = await SeedCustomerAsync(context, roleId: 957, email: "owner@example.com");
        var attacker = await SeedCustomerAsync(context, roleId: 958, email: "attacker@example.com");
        var sut = CreateSut(context);
        var created = await sut.CreateAsync(owner.Id, new CreateSshKeyDto { Label = "Owner-Key", PublicKey = ValidEd25519Key });

        await Assert.ThrowsAsync<NotFoundException>(() => sut.DeleteAsync(attacker.Id, created.Id));
    }

    [Fact]
    public async Task DeleteAsync_NotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context, roleId: 959);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() => sut.DeleteAsync(customer.Id, 9999));
    }
}
