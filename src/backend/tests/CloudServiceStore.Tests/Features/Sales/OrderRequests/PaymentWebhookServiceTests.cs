using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Sales.OrderRequests;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;
using Moq;

namespace CloudServiceStore.Tests.Features.Sales.OrderRequests;

public class PaymentWebhookServiceTests
{
    private readonly Mock<IPaymentGatewayService> _paymentGatewayServiceMock = new();
    private readonly Mock<IOrderRequestStatusTransitionService> _transitionServiceMock = new();

    private PaymentWebhookService CreateSut(AppDbContext context) => new(
        _paymentGatewayServiceMock.Object,
        _transitionServiceMock.Object,
        TestDbContextFactory.CreateUnitOfWork(context));

    private static async Task<OrderRequest> SeedOrderAsync(AppDbContext context, OrderRequestStatus status = OrderRequestStatus.New)
    {
        var order = new OrderRequest
        {
            OrderCode = "ORD-WEBHOOK-TEST",
            CustomerType = CustomerType.Individual,
            CustomerName = "Test Customer",
            CustomerEmail = "test@example.com",
            CustomerPhone = "0900000000",
            TotalPrice = 99000m,
            Status = status,
            CreatedAt = DateTime.UtcNow,
            Items = { new OrderRequestItem { ServicePlanId = 1, Quantity = 1, UnitPrice = 99000m, LineTotal = 99000m } }
        };
        context.OrderRequests.Add(order);
        await context.SaveChangesAsync();
        return order;
    }

    [Fact]
    public async Task HandlePayOsWebhookAsync_InvalidSignature_ReturnsInvalidSignatureAndDoesNotTransition()
    {
        using var context = TestDbContextFactory.CreateContext();
        _paymentGatewayServiceMock
            .Setup(p => p.VerifyWebhookAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((VerifiedPaymentResult?)null);
        var sut = CreateSut(context);

        var outcome = await sut.HandlePayOsWebhookAsync("{}");

        Assert.Equal(PayOsWebhookOutcome.InvalidSignature, outcome);
        _transitionServiceMock.Verify(
            t => t.TransitionAsync(It.IsAny<int>(), It.IsAny<OrderRequestStatus>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task HandlePayOsWebhookAsync_OrderNotFound_ReturnsOrderNotFoundAndDoesNotThrow()
    {
        using var context = TestDbContextFactory.CreateContext();
        _paymentGatewayServiceMock
            .Setup(p => p.VerifyWebhookAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new VerifiedPaymentResult { OrderCode = 9999, Amount = 99000 });
        var sut = CreateSut(context);

        var outcome = await sut.HandlePayOsWebhookAsync("{}");

        Assert.Equal(PayOsWebhookOutcome.OrderNotFound, outcome);
        _transitionServiceMock.Verify(
            t => t.TransitionAsync(It.IsAny<int>(), It.IsAny<OrderRequestStatus>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    // Guard idempotent - PayOS có thể gọi lại webhook (retry) sau khi đơn đã qua Paid; phải không được
    // transition lại (tránh gửi trùng email/ghi đè PaidAt, xem PaymentWebhookService).
    [Theory]
    [InlineData(OrderRequestStatus.Paid)]
    [InlineData(OrderRequestStatus.Provisioning)]
    [InlineData(OrderRequestStatus.Completed)]
    [InlineData(OrderRequestStatus.Cancelled)]
    public async Task HandlePayOsWebhookAsync_OrderAlreadyPastPaid_ReturnsAlreadyProcessedAndDoesNotTransitionAgain(OrderRequestStatus status)
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderAsync(context, status);
        _paymentGatewayServiceMock
            .Setup(p => p.VerifyWebhookAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new VerifiedPaymentResult { OrderCode = order.Id, Amount = 99000 });
        var sut = CreateSut(context);

        var outcome = await sut.HandlePayOsWebhookAsync("{}");

        Assert.Equal(PayOsWebhookOutcome.AlreadyProcessed, outcome);
        _transitionServiceMock.Verify(
            t => t.TransitionAsync(It.IsAny<int>(), It.IsAny<OrderRequestStatus>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Theory]
    [InlineData(OrderRequestStatus.New)]
    [InlineData(OrderRequestStatus.Contacted)]
    [InlineData(OrderRequestStatus.Confirmed)]
    public async Task HandlePayOsWebhookAsync_OrderBeforePaid_TransitionsToPaid(OrderRequestStatus status)
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderAsync(context, status);
        _paymentGatewayServiceMock
            .Setup(p => p.VerifyWebhookAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new VerifiedPaymentResult { OrderCode = order.Id, Amount = 99000 });
        var sut = CreateSut(context);

        var outcome = await sut.HandlePayOsWebhookAsync("{}");

        Assert.Equal(PayOsWebhookOutcome.Transitioned, outcome);
        _transitionServiceMock.Verify(
            t => t.TransitionAsync(order.Id, OrderRequestStatus.Paid, null, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task HandlePayOsWebhookAsync_OrderCodeOutsideIntRange_ReturnsOrderNotFound()
    {
        using var context = TestDbContextFactory.CreateContext();
        _paymentGatewayServiceMock
            .Setup(p => p.VerifyWebhookAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new VerifiedPaymentResult { OrderCode = (long)int.MaxValue + 1, Amount = 99000 });
        var sut = CreateSut(context);

        var outcome = await sut.HandlePayOsWebhookAsync("{}");

        Assert.Equal(PayOsWebhookOutcome.OrderNotFound, outcome);
    }
}
