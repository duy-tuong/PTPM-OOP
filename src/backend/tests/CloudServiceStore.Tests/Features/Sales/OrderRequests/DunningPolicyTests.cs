using CloudServiceStore.Application.Features.Sales.OrderRequests;

namespace CloudServiceStore.Tests.Features.Sales.OrderRequests;

public class DunningPolicyTests
{
    private static readonly DateTime Now = new(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void ShouldSuspend_ExpiredPastSuspendThreshold_ReturnsTrue()
    {
        var expiresAt = Now.AddDays(-3);

        Assert.True(DunningPolicy.ShouldSuspend(expiresAt, suspendedAt: null, terminatedAt: null, suspendAfterDays: 3, now: Now));
    }

    [Fact]
    public void ShouldSuspend_NotYetPastThreshold_ReturnsFalse()
    {
        var expiresAt = Now.AddDays(-2);

        Assert.False(DunningPolicy.ShouldSuspend(expiresAt, suspendedAt: null, terminatedAt: null, suspendAfterDays: 3, now: Now));
    }

    [Fact]
    public void ShouldSuspend_AlreadySuspended_ReturnsFalse()
    {
        var expiresAt = Now.AddDays(-5);

        Assert.False(DunningPolicy.ShouldSuspend(expiresAt, suspendedAt: Now.AddDays(-1), terminatedAt: null, suspendAfterDays: 3, now: Now));
    }

    [Fact]
    public void ShouldSuspend_AlreadyTerminated_ReturnsFalse()
    {
        var expiresAt = Now.AddDays(-20);

        Assert.False(DunningPolicy.ShouldSuspend(expiresAt, suspendedAt: null, terminatedAt: Now.AddDays(-1), suspendAfterDays: 3, now: Now));
    }

    [Fact]
    public void ShouldSuspend_NoExpiresAt_ReturnsFalse()
    {
        Assert.False(DunningPolicy.ShouldSuspend(expiresAt: null, suspendedAt: null, terminatedAt: null, suspendAfterDays: 3, now: Now));
    }

    [Fact]
    public void ShouldSendTerminationWarning_ExpiredPastWarningThreshold_ReturnsTrue()
    {
        var expiresAt = Now.AddDays(-7);

        Assert.True(DunningPolicy.ShouldSendTerminationWarning(expiresAt, terminationWarningSentAt: null, terminatedAt: null, warningAfterDays: 7, now: Now));
    }

    [Fact]
    public void ShouldSendTerminationWarning_AlreadySent_ReturnsFalse()
    {
        var expiresAt = Now.AddDays(-8);

        Assert.False(DunningPolicy.ShouldSendTerminationWarning(expiresAt, terminationWarningSentAt: Now.AddDays(-1), terminatedAt: null, warningAfterDays: 7, now: Now));
    }

    [Fact]
    public void ShouldSendTerminationWarning_NotYetPastThreshold_ReturnsFalse()
    {
        var expiresAt = Now.AddDays(-6);

        Assert.False(DunningPolicy.ShouldSendTerminationWarning(expiresAt, terminationWarningSentAt: null, terminatedAt: null, warningAfterDays: 7, now: Now));
    }

    [Fact]
    public void ShouldTerminate_ExpiredPastTerminateThreshold_ReturnsTrue()
    {
        var expiresAt = Now.AddDays(-14);

        Assert.True(DunningPolicy.ShouldTerminate(expiresAt, terminatedAt: null, terminateAfterDays: 14, now: Now));
    }

    [Fact]
    public void ShouldTerminate_AlreadyTerminated_ReturnsFalse()
    {
        var expiresAt = Now.AddDays(-20);

        Assert.False(DunningPolicy.ShouldTerminate(expiresAt, terminatedAt: Now.AddDays(-1), terminateAfterDays: 14, now: Now));
    }

    [Fact]
    public void ShouldTerminate_NotYetPastThreshold_ReturnsFalse()
    {
        var expiresAt = Now.AddDays(-13);

        Assert.False(DunningPolicy.ShouldTerminate(expiresAt, terminatedAt: null, terminateAfterDays: 14, now: Now));
    }

    [Fact]
    public void ComputeLifecycleStatus_NotExpired_ReturnsActive()
    {
        Assert.Equal(DunningPolicy.StatusActive, DunningPolicy.ComputeLifecycleStatus(Now.AddDays(10), null, null, Now));
    }

    [Fact]
    public void ComputeLifecycleStatus_ExpiredNotSuspendedYet_ReturnsOverdue()
    {
        Assert.Equal(DunningPolicy.StatusOverdue, DunningPolicy.ComputeLifecycleStatus(Now.AddDays(-1), null, null, Now));
    }

    [Fact]
    public void ComputeLifecycleStatus_Suspended_ReturnsSuspended()
    {
        Assert.Equal(DunningPolicy.StatusSuspended, DunningPolicy.ComputeLifecycleStatus(Now.AddDays(-5), Now.AddDays(-2), null, Now));
    }

    [Fact]
    public void ComputeLifecycleStatus_Terminated_ReturnsTerminated()
    {
        Assert.Equal(DunningPolicy.StatusTerminated, DunningPolicy.ComputeLifecycleStatus(Now.AddDays(-20), Now.AddDays(-17), Now.AddDays(-6), Now));
    }

    [Fact]
    public void ComputeLifecycleStatus_NoExpiresAt_ReturnsActive()
    {
        Assert.Equal(DunningPolicy.StatusActive, DunningPolicy.ComputeLifecycleStatus(null, null, null, Now));
    }
}
