using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Observers;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;
using Moq;

namespace CloudServiceStore.Tests.Infrastructure.Observers;

public class EmailConsultationObserverTests
{
    private static async Task<ConsultationRequest> SeedRequestAsync(AppDbContext context)
    {
        var request = new ConsultationRequest
        {
            RequestCode = "CONS-EMAIL-TEST",
            CustomerType = CustomerType.Individual,
            FullName = "Test Customer",
            Email = "customer@example.com",
            Phone = "0900000000",
            Subject = "Test subject",
            Message = "Test message",
            CreatedAt = DateTime.UtcNow
        };
        context.ConsultationRequests.Add(request);
        await context.SaveChangesAsync();
        return request;
    }

    private static (EmailConsultationObserver Sut, Mock<IEmailService> EmailServiceMock) CreateSut(AppDbContext context)
    {
        var unitOfWork = TestDbContextFactory.CreateUnitOfWork(context);
        var emailServiceMock = new Mock<IEmailService>();
        var sut = new EmailConsultationObserver(unitOfWork, emailServiceMock.Object);
        return (sut, emailServiceMock);
    }

    [Theory]
    [InlineData(ConsultationStatus.Contacted)]
    [InlineData(ConsultationStatus.Resolved)]
    [InlineData(ConsultationStatus.Closed)]
    public async Task OnStatusChangedAsync_MeaningfulStatus_SendsEmailToCustomer(ConsultationStatus newStatus)
    {
        using var context = TestDbContextFactory.CreateContext();
        var request = await SeedRequestAsync(context);
        var (sut, emailServiceMock) = CreateSut(context);

        await sut.OnStatusChangedAsync(request.Id, ConsultationStatus.New, newStatus, Guid.NewGuid());

        emailServiceMock.Verify(e => e.SendAsync(
            "customer@example.com",
            It.IsAny<string>(),
            It.Is<string>(body => body.Contains(request.RequestCode)),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task OnStatusChangedAsync_RequestNotFound_DoesNotThrowOrSendEmail()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (sut, emailServiceMock) = CreateSut(context);

        var exception = await Record.ExceptionAsync(() =>
            sut.OnStatusChangedAsync(9999, ConsultationStatus.New, ConsultationStatus.Contacted, Guid.NewGuid()));

        Assert.Null(exception);
        emailServiceMock.Verify(e => e.SendAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
