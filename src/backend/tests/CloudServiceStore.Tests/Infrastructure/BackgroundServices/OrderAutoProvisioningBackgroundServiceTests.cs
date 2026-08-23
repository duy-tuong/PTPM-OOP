using CloudServiceStore.Infrastructure.BackgroundServices;

namespace CloudServiceStore.Tests.Infrastructure.BackgroundServices;

public class OrderAutoProvisioningBackgroundServiceTests
{
    [Fact]
    public void IsDue_ElapsedTimeExceedsDelay_ReturnsTrue()
    {
        var now = new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);
        var enteredAt = now.AddSeconds(-31);

        Assert.True(OrderAutoProvisioningBackgroundService.IsDue(enteredAt, delaySeconds: 30, now));
    }

    [Fact]
    public void IsDue_ElapsedTimeBelowDelay_ReturnsFalse()
    {
        var now = new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);
        var enteredAt = now.AddSeconds(-10);

        Assert.False(OrderAutoProvisioningBackgroundService.IsDue(enteredAt, delaySeconds: 30, now));
    }

    [Fact]
    public void IsDue_ElapsedTimeExactlyEqualsDelay_ReturnsTrue()
    {
        var now = new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);
        var enteredAt = now.AddSeconds(-30);

        Assert.True(OrderAutoProvisioningBackgroundService.IsDue(enteredAt, delaySeconds: 30, now));
    }
}
