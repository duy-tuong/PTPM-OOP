using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Observers;
using Moq;

namespace CloudServiceStore.Tests.Infrastructure.Observers;

public class EmailOrderObserverTests
{
    private static (EmailOrderObserver Sut, Mock<IEmailService> EmailServiceMock) CreateSut(OrderRequest? order)
    {
        var repositoryMock = new Mock<IRepository<OrderRequest, int>>();
        repositoryMock.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync(order);

        var unitOfWorkMock = new Mock<IUnitOfWork>();
        unitOfWorkMock.Setup(u => u.Repository<OrderRequest, int>()).Returns(repositoryMock.Object);

        var emailServiceMock = new Mock<IEmailService>();
        var sut = new EmailOrderObserver(unitOfWorkMock.Object, emailServiceMock.Object);
        return (sut, emailServiceMock);
    }

    private static OrderRequest BuildOrder() => new()
    {
        Id = 42,
        OrderCode = "ORD-TEST-001",
        CustomerName = "Test Customer",
        CustomerEmail = "customer@example.com",
        CustomerPhone = "0900000000",
    };

    [Theory]
    [InlineData(OrderRequestStatus.Paid)]
    [InlineData(OrderRequestStatus.Provisioning)]
    [InlineData(OrderRequestStatus.Completed)]
    [InlineData(OrderRequestStatus.Cancelled)]
    public async Task OnStatusChangedAsync_MeaningfulStatus_SendsEmailToCustomer(OrderRequestStatus newStatus)
    {
        var (sut, emailServiceMock) = CreateSut(BuildOrder());

        await sut.OnStatusChangedAsync(42, OrderRequestStatus.Confirmed, newStatus, Guid.NewGuid());

        emailServiceMock.Verify(e => e.SendAsync(
            "customer@example.com",
            It.IsAny<string>(),
            It.Is<string>(body => body.Contains("ORD-TEST-001")),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Theory]
    [InlineData(OrderRequestStatus.Contacted)]
    [InlineData(OrderRequestStatus.Confirmed)]
    public async Task OnStatusChangedAsync_NonMeaningfulStatus_DoesNotSendEmail(OrderRequestStatus newStatus)
    {
        var (sut, emailServiceMock) = CreateSut(BuildOrder());

        await sut.OnStatusChangedAsync(42, OrderRequestStatus.New, newStatus, Guid.NewGuid());

        emailServiceMock.Verify(e => e.SendAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task OnStatusChangedAsync_OrderNotFound_DoesNotThrowOrSendEmail()
    {
        var (sut, emailServiceMock) = CreateSut(null);

        var exception = await Record.ExceptionAsync(() =>
            sut.OnStatusChangedAsync(999, OrderRequestStatus.Confirmed, OrderRequestStatus.Paid, Guid.NewGuid()));

        Assert.Null(exception);
        emailServiceMock.Verify(e => e.SendAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
