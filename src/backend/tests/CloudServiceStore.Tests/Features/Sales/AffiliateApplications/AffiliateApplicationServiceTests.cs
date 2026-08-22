using CloudServiceStore.Application.Features.Sales.AffiliateApplications;
using CloudServiceStore.Application.Features.Sales.AffiliateApplications.Dtos;
using CloudServiceStore.Tests.TestHelpers;

namespace CloudServiceStore.Tests.Features.Sales.AffiliateApplications;

public class AffiliateApplicationServiceTests
{
    private static CreateAffiliateApplicationDto BuildDto() => new()
    {
        FullName = "Test Affiliate",
        Email = "affiliate@example.com",
        Phone = "0900000000",
    };

    [Fact]
    public async Task CreateAsync_CustomerIdProvided_LinksApplicationToCustomer()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = new AffiliateApplicationService(TestDbContextFactory.CreateUnitOfWork(context));
        var customerId = Guid.NewGuid();

        var result = await sut.CreateAsync(BuildDto(), customerId);

        var saved = context.AffiliateApplications.Single(a => a.Id == result.Id);
        Assert.Equal(customerId, saved.CustomerId);
    }

    [Fact]
    public async Task CreateAsync_NoCustomerId_LeavesCustomerIdNull()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = new AffiliateApplicationService(TestDbContextFactory.CreateUnitOfWork(context));

        var result = await sut.CreateAsync(BuildDto());

        var saved = context.AffiliateApplications.Single(a => a.Id == result.Id);
        Assert.Null(saved.CustomerId);
    }
}
