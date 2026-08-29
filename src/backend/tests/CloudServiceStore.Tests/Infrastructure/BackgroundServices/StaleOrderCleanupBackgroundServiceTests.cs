using CloudServiceStore.Infrastructure.BackgroundServices;


namespace CloudServiceStore.Tests.Infrastructure.BackgroundServices;


public class StaleOrderCleanupBackgroundServiceTests
{
    [Fact]
    public void IsDue_ElapsedDaysExceedsThreshold_ReturnsTrue()
    {
        var now = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc);
        var createdAt = now.AddDays(-4);


        Assert.True(StaleOrderCleanupBackgroundService.IsDue(createdAt, cancelAfterDays: 3, now));
    }


    [Fact]
    public void IsDue_ElapsedDaysBelowThreshold_ReturnsFalse()
    {
        var now = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc);
        var createdAt = now.AddDays(-1);


        Assert.False(StaleOrderCleanupBackgroundService.IsDue(createdAt, cancelAfterDays: 3, now));
    }


    [Fact]
    public void IsDue_ElapsedDaysExactlyEqualsThreshold_ReturnsTrue()
    {
        var now = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc);
        var createdAt = now.AddDays(-3);


        Assert.True(StaleOrderCleanupBackgroundService.IsDue(createdAt, cancelAfterDays: 3, now));
    }
}



