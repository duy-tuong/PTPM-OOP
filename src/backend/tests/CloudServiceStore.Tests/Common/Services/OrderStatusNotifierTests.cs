using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Services;
using CloudServiceStore.Domain.Enums;
using Moq;

namespace CloudServiceStore.Tests.Common.Services;

public class OrderStatusNotifierTests
{
    [Fact]
    public async Task NotifyAsync_NoObservers_CompletesWithoutError()
    {
        var sut = new OrderStatusNotifier([]);

        var exception = await Record.ExceptionAsync(() =>
            sut.NotifyAsync(1, OrderRequestStatus.New, OrderRequestStatus.Contacted, null));

        Assert.Null(exception);
    }

    [Fact]
    public async Task NotifyAsync_MultipleObservers_InvokesEachExactlyOnceWithSameArgs()
    {
        var observer1 = new Mock<IOrderStatusObserver>();
        var observer2 = new Mock<IOrderStatusObserver>();
        var sut = new OrderStatusNotifier([observer1.Object, observer2.Object]);
        var changedByUserId = Guid.NewGuid();

        await sut.NotifyAsync(7, OrderRequestStatus.Contacted, OrderRequestStatus.Confirmed, changedByUserId);

        observer1.Verify(o => o.OnStatusChangedAsync(7, OrderRequestStatus.Contacted, OrderRequestStatus.Confirmed, changedByUserId, It.IsAny<CancellationToken>()), Times.Once);
        observer2.Verify(o => o.OnStatusChangedAsync(7, OrderRequestStatus.Contacted, OrderRequestStatus.Confirmed, changedByUserId, It.IsAny<CancellationToken>()), Times.Once);
    }
}
