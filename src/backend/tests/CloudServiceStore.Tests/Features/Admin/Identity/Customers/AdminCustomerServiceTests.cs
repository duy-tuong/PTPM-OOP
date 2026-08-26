using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Features.Admin.Identity.Customers;
using CloudServiceStore.Application.Features.Admin.Identity.Customers.Dtos;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;

namespace CloudServiceStore.Tests.Features.Admin.Identity.Customers;

public class AdminCustomerServiceTests
{
    private static AdminCustomerService CreateSut(AppDbContext context) =>
        new(TestDbContextFactory.CreateUnitOfWork(context));

    // Id/role cố ý khác dữ liệu HasData - test không phụ thuộc InMemory provider có tự nạp seed hay không.
    private static async Task<Customer> SeedCustomerAsync(
        AppDbContext context, int roleId = 801, CustomerType customerType = CustomerType.Individual, string email = "crm-customer@example.com")
    {
        context.AppRoles.Add(new AppRole { Id = roleId, Name = $"Test Role {roleId}", Description = "Test" });
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            RoleId = roleId,
            Email = email,
            PasswordHash = "hash",
            FullName = "CRM Test Customer",
            Phone = "0900000088",
            CustomerType = customerType,
        };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();
        return customer;
    }

    private static async Task<AppUser> SeedAppUserAsync(AppDbContext context, string username = "sales-rep-1")
    {
        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Username = username,
            Email = $"{username}@cloudverse.local",
            PasswordHash = "hash",
            FullName = "Sales Rep Nguyen Van A",
        };
        context.AppUsers.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    [Fact]
    public async Task GetByIdAsync_NotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() => sut.GetByIdAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task GetByIdAsync_Found_ReturnsDtoWithAssignedSalesRepName()
    {
        using var context = TestDbContextFactory.CreateContext();
        var salesRep = await SeedAppUserAsync(context);
        var customer = await SeedCustomerAsync(context);
        customer.AssignedSalesRepUserId = salesRep.Id;
        context.Customers.Update(customer);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetByIdAsync(customer.Id);

        Assert.Equal(customer.Id, result.Id);
        Assert.Equal(salesRep.Id, result.AssignedSalesRepUserId);
        Assert.Equal(salesRep.FullName, result.AssignedSalesRepUserName);
    }

    [Fact]
    public async Task UpdateAsync_NotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            sut.UpdateAsync(Guid.NewGuid(), new UpdateCustomerDto { BillingAddress = "123 Main St" }));
    }

    [Fact]
    public async Task UpdateAsync_InvalidSalesRepUserId_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var customer = await SeedCustomerAsync(context);
        var sut = CreateSut(context);

        await Assert.ThrowsAsync<ValidationException>(() =>
            sut.UpdateAsync(customer.Id, new UpdateCustomerDto { AssignedSalesRepUserId = Guid.NewGuid() }));
    }

    [Fact]
    public async Task UpdateAsync_ValidFields_SavesAllFieldsAndReturnsUpdatedDto()
    {
        using var context = TestDbContextFactory.CreateContext();
        var salesRep = await SeedAppUserAsync(context);
        var customer = await SeedCustomerAsync(context);
        var sut = CreateSut(context);

        var dto = new UpdateCustomerDto
        {
            BillingAddress = "456 Business Ave",
            LegalRepresentativeName = "Tran Thi B",
            BusinessLicenseNumber = "0123456789",
            CreditLimit = 50000000m,
            AssignedSalesRepUserId = salesRep.Id,
        };
        var result = await sut.UpdateAsync(customer.Id, dto);

        Assert.Equal("456 Business Ave", result.BillingAddress);
        Assert.Equal("Tran Thi B", result.LegalRepresentativeName);
        Assert.Equal("0123456789", result.BusinessLicenseNumber);
        Assert.Equal(50000000m, result.CreditLimit);
        Assert.Equal(salesRep.Id, result.AssignedSalesRepUserId);
        Assert.Equal(salesRep.FullName, result.AssignedSalesRepUserName);

        var persisted = context.Customers.Single(c => c.Id == customer.Id);
        Assert.Equal("456 Business Ave", persisted.BillingAddress);
        Assert.Equal(salesRep.Id, persisted.AssignedSalesRepUserId);
        Assert.NotNull(persisted.UpdatedAt);
    }

    [Fact]
    public async Task UpdateAsync_NullAssignedSalesRepUserId_ClearsExistingAssignment()
    {
        using var context = TestDbContextFactory.CreateContext();
        var salesRep = await SeedAppUserAsync(context);
        var customer = await SeedCustomerAsync(context);
        customer.AssignedSalesRepUserId = salesRep.Id;
        context.Customers.Update(customer);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.UpdateAsync(customer.Id, new UpdateCustomerDto { AssignedSalesRepUserId = null });

        Assert.Null(result.AssignedSalesRepUserId);
        Assert.Null(result.AssignedSalesRepUserName);
        var persisted = context.Customers.Single(c => c.Id == customer.Id);
        Assert.Null(persisted.AssignedSalesRepUserId);
    }

    [Fact]
    public async Task GetListAsync_FilterByCustomerType_ReturnsMatchingOnly()
    {
        using var context = TestDbContextFactory.CreateContext();
        await SeedCustomerAsync(context, roleId: 811, customerType: CustomerType.Individual, email: "individual@example.com");
        await SeedCustomerAsync(context, roleId: 812, customerType: CustomerType.Business, email: "business@example.com");
        var sut = CreateSut(context);

        var result = await sut.GetListAsync(new CustomerQueryParams { CustomerType = CustomerType.Business });

        var item = Assert.Single(result.Items);
        Assert.Equal("business@example.com", item.Email);
    }

    [Fact]
    public async Task GetListAsync_FilterByAssignedSalesRepUserId_ReturnsMatchingOnly()
    {
        using var context = TestDbContextFactory.CreateContext();
        var salesRep = await SeedAppUserAsync(context);
        var assignedCustomer = await SeedCustomerAsync(context, roleId: 821, email: "assigned@example.com");
        assignedCustomer.AssignedSalesRepUserId = salesRep.Id;
        context.Customers.Update(assignedCustomer);
        await SeedCustomerAsync(context, roleId: 822, email: "unassigned@example.com");
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var result = await sut.GetListAsync(new CustomerQueryParams { AssignedSalesRepUserId = salesRep.Id });

        var item = Assert.Single(result.Items);
        Assert.Equal("assigned@example.com", item.Email);
    }
}
