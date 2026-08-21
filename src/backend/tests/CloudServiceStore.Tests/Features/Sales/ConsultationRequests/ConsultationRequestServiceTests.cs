using CloudServiceStore.Application.Features.Sales.ConsultationRequests;
using CloudServiceStore.Application.Features.Sales.ConsultationRequests.Dtos;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Tests.TestHelpers;

namespace CloudServiceStore.Tests.Features.Sales.ConsultationRequests;

public class ConsultationRequestServiceTests
{
    private static CreateConsultationRequestDto BuildDto() => new()
    {
        CustomerType = CustomerType.Individual,
        FullName = "Test Customer",
        Email = "test@example.com",
        Phone = "0900000000",
        Subject = "Test subject",
        Message = "Test message",
    };

    [Fact]
    public async Task CreateAsync_CustomerIdProvided_LinksRequestToCustomer()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = new ConsultationRequestService(TestDbContextFactory.CreateUnitOfWork(context));
        var customerId = Guid.NewGuid();

        var result = await sut.CreateAsync(BuildDto(), customerId);

        var saved = context.ConsultationRequests.Single(c => c.Id == result.Id);
        Assert.Equal(customerId, saved.CustomerId);
    }

    [Fact]
    public async Task CreateAsync_NoCustomerId_LeavesCustomerIdNull()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = new ConsultationRequestService(TestDbContextFactory.CreateUnitOfWork(context));

        var result = await sut.CreateAsync(BuildDto());

        var saved = context.ConsultationRequests.Single(c => c.Id == result.Id);
        Assert.Null(saved.CustomerId);
    }
}
