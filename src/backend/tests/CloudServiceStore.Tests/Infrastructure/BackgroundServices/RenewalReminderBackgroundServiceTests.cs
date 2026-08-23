using CloudServiceStore.Infrastructure.BackgroundServices;

namespace CloudServiceStore.Tests.Infrastructure.BackgroundServices;

public class RenewalReminderBackgroundServiceTests
{
    private static readonly DateTime Now = new(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void IsWithinReminderWindow_ExpiresInsideLeadWindow_ReturnsTrue()
    {
        var expiresAt = Now.AddDays(5);

        Assert.True(RenewalReminderBackgroundService.IsWithinReminderWindow(
            expiresAt, renewalReminderSentAt: null, renewsFromItemId: null, leadDays: 7, now: Now));
    }

    [Fact]
    public void IsWithinReminderWindow_ExpiresOutsideLeadWindow_ReturnsFalse()
    {
        var expiresAt = Now.AddDays(30);

        Assert.False(RenewalReminderBackgroundService.IsWithinReminderWindow(
            expiresAt, renewalReminderSentAt: null, renewsFromItemId: null, leadDays: 7, now: Now));
    }

    [Fact]
    public void IsWithinReminderWindow_AlreadyExpired_ReturnsFalse()
    {
        var expiresAt = Now.AddDays(-1);

        Assert.False(RenewalReminderBackgroundService.IsWithinReminderWindow(
            expiresAt, renewalReminderSentAt: null, renewsFromItemId: null, leadDays: 7, now: Now));
    }

    [Fact]
    public void IsWithinReminderWindow_ReminderAlreadySent_ReturnsFalse()
    {
        var expiresAt = Now.AddDays(5);

        Assert.False(RenewalReminderBackgroundService.IsWithinReminderWindow(
            expiresAt, renewalReminderSentAt: Now.AddDays(-1), renewsFromItemId: null, leadDays: 7, now: Now));
    }

    [Fact]
    public void IsWithinReminderWindow_RenewalReceiptItem_ReturnsFalse()
    {
        var expiresAt = Now.AddDays(5);

        Assert.False(RenewalReminderBackgroundService.IsWithinReminderWindow(
            expiresAt, renewalReminderSentAt: null, renewsFromItemId: 42, leadDays: 7, now: Now));
    }

    [Fact]
    public void IsWithinReminderWindow_NoExpiresAt_ReturnsFalse()
    {
        Assert.False(RenewalReminderBackgroundService.IsWithinReminderWindow(
            expiresAt: null, renewalReminderSentAt: null, renewsFromItemId: null, leadDays: 7, now: Now));
    }
}
