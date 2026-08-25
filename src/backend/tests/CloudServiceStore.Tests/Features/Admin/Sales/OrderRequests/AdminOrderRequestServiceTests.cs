using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Services;
using CloudServiceStore.Application.Features.Admin.Sales.OrderRequests;
using CloudServiceStore.Application.Features.Admin.Sales.OrderRequests.Dtos;
using CloudServiceStore.Application.Features.Sales.OrderRequests;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Infrastructure.Services;
using CloudServiceStore.Tests.TestHelpers;
using Moq;

namespace CloudServiceStore.Tests.Features.Admin.Sales.OrderRequests;

public class AdminOrderRequestServiceTests
{
    private static async Task<OrderRequest> SeedOrderRequestAsync(
        AppDbContext context,
        OrderRequestStatus status = OrderRequestStatus.New,
        Guid? assignedToUserId = null)
    {
        var order = new OrderRequest
        {
            OrderCode = "ORD-TEST-001",
            CustomerType = CustomerType.Individual,
            CustomerName = "Test Customer",
            CustomerEmail = "test@example.com",
            CustomerPhone = "0900000000",
            TotalPrice = 100000m,
            Status = status,
            AssignedToUserId = assignedToUserId,
            CreatedAt = DateTime.UtcNow,
            Items = { new OrderRequestItem { Quantity = 1, UnitPrice = 100000m, LineTotal = 100000m } }
        };
        context.OrderRequests.Add(order);
        await context.SaveChangesAsync();
        return order;
    }

    private static AdminOrderRequestService CreateSut(AppDbContext context, Mock<IOrderStatusObserver> observerMock)
    {
        var unitOfWork = TestDbContextFactory.CreateUnitOfWork(context);
        var notifier = new OrderStatusNotifier([observerMock.Object]);
        var transitionService = new OrderRequestStatusTransitionService(unitOfWork, notifier, new FakeProvisioningGenerator());
        return new AdminOrderRequestService(unitOfWork, transitionService);
    }

    [Fact]
    public async Task UpdateStatusAsync_NotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        await Assert.ThrowsAsync<NotFoundException>(() =>
            sut.UpdateStatusAsync(9999, new UpdateOrderRequestStatusDto { NewStatus = OrderRequestStatus.Contacted }, Guid.NewGuid()));
    }

    [Fact]
    public async Task UpdateStatusAsync_Success_NotifiesObserverWithOldAndNewStatus()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.New);
        var observerMock = new Mock<IOrderStatusObserver>();
        var sut = CreateSut(context, observerMock);
        var changedByUserId = Guid.NewGuid();

        var result = await sut.UpdateStatusAsync(order.Id, new UpdateOrderRequestStatusDto { NewStatus = OrderRequestStatus.Contacted }, changedByUserId);

        observerMock.Verify(o => o.OnStatusChangedAsync(
            order.Id, OrderRequestStatus.New, OrderRequestStatus.Contacted, changedByUserId, It.IsAny<CancellationToken>()), Times.Once);
        Assert.Equal(nameof(OrderRequestStatus.Contacted), result.Status);
    }

    [Fact]
    public async Task UpdateStatusAsync_UnassignedOrder_AssignsToChangedByUser()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, assignedToUserId: null);
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());
        var changedByUserId = Guid.NewGuid();

        await sut.UpdateStatusAsync(order.Id, new UpdateOrderRequestStatusDto { NewStatus = OrderRequestStatus.Contacted }, changedByUserId);

        var persisted = context.OrderRequests.Single(o => o.Id == order.Id);
        Assert.Equal(changedByUserId, persisted.AssignedToUserId);
    }

    [Fact]
    public async Task UpdateStatusAsync_AlreadyAssignedOrder_DoesNotOverwriteAssignee()
    {
        using var context = TestDbContextFactory.CreateContext();
        var existingAssignee = Guid.NewGuid();
        var order = await SeedOrderRequestAsync(context, assignedToUserId: existingAssignee);
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        await sut.UpdateStatusAsync(order.Id, new UpdateOrderRequestStatusDto { NewStatus = OrderRequestStatus.Confirmed }, Guid.NewGuid());

        var persisted = context.OrderRequests.Single(o => o.Id == order.Id);
        Assert.Equal(existingAssignee, persisted.AssignedToUserId);
    }

    [Fact]
    public async Task UpdateStatusAsync_OrderAlreadyCompleted_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.Completed);
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        await Assert.ThrowsAsync<ValidationException>(() =>
            sut.UpdateStatusAsync(order.Id, new UpdateOrderRequestStatusDto { NewStatus = OrderRequestStatus.New }, Guid.NewGuid()));
    }

    [Fact]
    public async Task UpdateStatusAsync_OrderAlreadyCancelled_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.Cancelled);
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        await Assert.ThrowsAsync<ValidationException>(() =>
            sut.UpdateStatusAsync(order.Id, new UpdateOrderRequestStatusDto { NewStatus = OrderRequestStatus.Confirmed }, Guid.NewGuid()));
    }

    [Fact]
    public async Task UpdateStatusAsync_SameTerminalStatus_Succeeds()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.Completed);
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        var result = await sut.UpdateStatusAsync(order.Id, new UpdateOrderRequestStatusDto { NewStatus = OrderRequestStatus.Completed }, Guid.NewGuid());

        Assert.Equal(nameof(OrderRequestStatus.Completed), result.Status);
    }

    // Dunning Automation (Đợt 2, Phần 8) - Admin gỡ tạm khóa thủ công.
    [Fact]
    public async Task LiftSuspensionAsync_ItemNotFound_ThrowsNotFoundException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        await Assert.ThrowsAsync<NotFoundException>(() => sut.LiftSuspensionAsync(9999));
    }

    [Fact]
    public async Task LiftSuspensionAsync_NotSuspended_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.Completed);
        var item = order.Items.Single();
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        await Assert.ThrowsAsync<ValidationException>(() => sut.LiftSuspensionAsync(item.Id));
    }

    [Fact]
    public async Task LiftSuspensionAsync_AlreadyTerminated_ThrowsValidationException()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.Completed);
        var item = order.Items.Single();
        item.SuspendedAt = DateTime.UtcNow.AddDays(-10);
        item.TerminatedAt = DateTime.UtcNow.AddDays(-1);
        context.OrderRequestItems.Update(item);
        await context.SaveChangesAsync();
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        await Assert.ThrowsAsync<ValidationException>(() => sut.LiftSuspensionAsync(item.Id));
    }

    [Fact]
    public async Task LiftSuspensionAsync_Suspended_ClearsSuspendedAndWarningFields()
    {
        using var context = TestDbContextFactory.CreateContext();
        var order = await SeedOrderRequestAsync(context, status: OrderRequestStatus.Completed);
        var item = order.Items.Single();
        item.SuspendedAt = DateTime.UtcNow.AddDays(-5);
        item.TerminationWarningSentAt = DateTime.UtcNow.AddDays(-1);
        context.OrderRequestItems.Update(item);
        await context.SaveChangesAsync();
        var sut = CreateSut(context, new Mock<IOrderStatusObserver>());

        await sut.LiftSuspensionAsync(item.Id);

        var reloaded = context.OrderRequestItems.Single(i => i.Id == item.Id);
        Assert.Null(reloaded.SuspendedAt);
        Assert.Null(reloaded.TerminationWarningSentAt);
    }
}
