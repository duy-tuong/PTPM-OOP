 using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Observers;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Tests.TestHelpers;
using Moq;


namespace CloudServiceStore.Tests.Infrastructure.Observers;


public class EmailOrderObserverTests
{
    private static async Task<OrderRequest> SeedOrderAsync(
        AppDbContext context,
        Action<OrderRequestItem>? configureItem = null,
        Action<OrderRequest>? configureOrder = null)
    {
        var item = new OrderRequestItem { ServicePlanId = 1, Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m };
        configureItem?.Invoke(item);


        var order = new OrderRequest
        {
            OrderCode = "ORD-TEST-001",
            CustomerType = CustomerType.Individual,
            CustomerName = "Test Customer",
            CustomerEmail = "customer@example.com",
            CustomerPhone = "0900000000",
            TotalPrice = 100000m,
            CreatedAt = DateTime.UtcNow,
            Items = { item }
        };
        configureOrder?.Invoke(order);
        context.OrderRequests.Add(order);
        await context.SaveChangesAsync();
        return order;
    }


    private static (EmailOrderObserver Sut, Mock<IEmailService> EmailServiceMock) CreateSut(AppDbContext context)
    {
        var unitOfWork = TestDbContextFactory.CreateUnitOfWork(context);
        var emailServiceMock = new Mock<IEmailService>();
        var sut = new EmailOrderObserver(unitOfWork, emailServiceMock.Object);
        return (sut, emailServiceMock);
    }


    [Theory]
    [InlineData(OrderRequestStatus.Paid)]
    [InlineData(OrderRequestStatus.Provisioning)]
    [InlineData(OrderRequestStatus.Cancelled)]
    public async Task OnStatusChangedAsync_MeaningfulStatus_SendsEmailToCustomer(OrderRequestStatus newStatus)
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderAsync(context);
        var (sut, emailServiceMock) = CreateSut(context);


        await sut.OnStatusChangedAsync(order.Id, OrderRequestStatus.Confirmed, newStatus, Guid.NewGuid());


        emailServiceMock.Verify(e => e.SendAsync(
            "customer@example.com",
            It.IsAny<string>(),
            It.Is<string>(body => body.Contains(order.OrderCode)),
            It.IsAny<CancellationToken>()), Times.Once);
    }


    [Theory]
    [InlineData(OrderRequestStatus.Contacted)]
    [InlineData(OrderRequestStatus.Confirmed)]
    public async Task OnStatusChangedAsync_NonMeaningfulStatus_DoesNotSendEmail(OrderRequestStatus newStatus)
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderAsync(context);
        var (sut, emailServiceMock) = CreateSut(context);


        await sut.OnStatusChangedAsync(order.Id, OrderRequestStatus.New, newStatus, Guid.NewGuid());


        emailServiceMock.Verify(e => e.SendAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }


    [Fact]
    public async Task OnStatusChangedAsync_OrderNotFound_DoesNotThrowOrSendEmail()
    {
        using var context = TestDbContextFactory.CreateContext();
        var (sut, emailServiceMock) = CreateSut(context);


        var exception = await Record.ExceptionAsync(() =>
            sut.OnStatusChangedAsync(9999, OrderRequestStatus.Confirmed, OrderRequestStatus.Paid, Guid.NewGuid()));


        Assert.Null(exception);
        emailServiceMock.Verify(e => e.SendAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }


    [Fact]
    public async Task OnStatusChangedAsync_ToCompleted_ServicePlanItem_EmailIncludesCredentials()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderAsync(context, item =>
        {
            item.ProvisionedIpAddress = "203.0.113.10";
            item.ProvisionedRootPassword = "TestPassword12345";
        });
        var (sut, emailServiceMock) = CreateSut(context);


        await sut.OnStatusChangedAsync(order.Id, OrderRequestStatus.Provisioning, OrderRequestStatus.Completed, Guid.NewGuid());


        emailServiceMock.Verify(e => e.SendAsync(
            "customer@example.com",
            It.IsAny<string>(),
            It.Is<string>(body => body.Contains("203.0.113.10") && body.Contains("TestPassword12345")),
            It.IsAny<CancellationToken>()), Times.Once);
    }


    [Fact]
    public async Task OnStatusChangedAsync_ToCompleted_TldItem_EmailIncludesNameservers()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderAsync(context, item =>
        {
            item.ServicePlanId = null;
            item.TldPricingId = 1;
            item.DomainName = "example";
            item.ProvisionedNameservers = "ns1.cloudverse.vn, ns2.cloudverse.vn";
        });
        var (sut, emailServiceMock) = CreateSut(context);


        await sut.OnStatusChangedAsync(order.Id, OrderRequestStatus.Provisioning, OrderRequestStatus.Completed, Guid.NewGuid());


        emailServiceMock.Verify(e => e.SendAsync(
            "customer@example.com",
            It.IsAny<string>(),
            It.Is<string>(body => body.Contains("ns1.cloudverse.vn")),
            It.IsAny<CancellationToken>()), Times.Once);
    }


    [Fact]
    public async Task OnStatusChangedAsync_ToCompleted_RenewalItem_EmailShowsRenewalMessageNotBlankCredentials()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderAsync(context, item => item.RenewsFromItemId = 999);
        var (sut, emailServiceMock) = CreateSut(context);


        await sut.OnStatusChangedAsync(order.Id, OrderRequestStatus.Provisioning, OrderRequestStatus.Completed, Guid.NewGuid());


        emailServiceMock.Verify(e => e.SendAsync(
            "customer@example.com",
            It.IsAny<string>(),
            It.Is<string>(body => body.Contains("gia hạn thành công")),
            It.IsAny<CancellationToken>()), Times.Once);
    }


    // Đợt 13, Phần 4 (D4) - huỷ đơn ĐÃ thu tiền phải có câu khác biệt (hứa hẹn xử lý hoàn tiền), huỷ đơn
    // chưa từng thu tiền giữ nguyên câu cũ - PaidAt has_value là tín hiệu duy nhất phân biệt 2 trường hợp.
    [Fact]
    public async Task OnStatusChangedAsync_ToCancelled_OrderWasPaid_EmailMentionsRefund()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderAsync(context, configureOrder: o => o.PaidAt = DateTime.UtcNow.AddDays(-1));
        var (sut, emailServiceMock) = CreateSut(context);


        await sut.OnStatusChangedAsync(order.Id, OrderRequestStatus.Paid, OrderRequestStatus.Cancelled, Guid.NewGuid());


        emailServiceMock.Verify(e => e.SendAsync(
            "customer@example.com",
            It.IsAny<string>(),
            It.Is<string>(body => body.Contains("đã được thanh toán") && body.Contains("hoàn tiền")),
            It.IsAny<CancellationToken>()), Times.Once);
    }


    [Fact]
    public async Task OnStatusChangedAsync_ToCancelled_OrderWasNeverPaid_EmailKeepsGenericMessage()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderAsync(context);
        var (sut, emailServiceMock) = CreateSut(context);


        await sut.OnStatusChangedAsync(order.Id, OrderRequestStatus.New, OrderRequestStatus.Cancelled, Guid.NewGuid());


        emailServiceMock.Verify(e => e.SendAsync(
            "customer@example.com",
            It.IsAny<string>(),
            It.Is<string>(body => !body.Contains("hoàn tiền") && body.Contains($"Đơn hàng {order.OrderCode} đã bị huỷ.")),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}

