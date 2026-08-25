namespace CloudServiceStore.Application.Features.Sales.OrderRequests;

// Dunning Automation (Đợt 2, Phần 8) - hàm thuần (pure), không phụ thuộc EF/DbContext, dùng chung cho:
// (1) DunningBackgroundService (Infrastructure) viết lại thành biểu thức LINQ-to-Entities tương đương
// trong .Where() (Entity Framework không dịch được lời gọi hàm C# tuỳ ý - mirror đúng pattern
// RenewalReminderBackgroundService.IsWithinReminderWindow/OrderAutoProvisioningBackgroundService.IsDue),
// (2) OrderRequestService/AdminOrderRequestService tính LifecycleStatus hiển thị cho DTO. Đặt ở
// Application (không phải Infrastructure) vì cả 2 nơi dùng đều là Application-layer service.
public static class DunningPolicy
{
    public const string StatusActive = "Active";
    public const string StatusOverdue = "Overdue";
    public const string StatusSuspended = "Suspended";
    public const string StatusTerminated = "Terminated";

    public static bool ShouldSuspend(DateTime? expiresAt, DateTime? suspendedAt, DateTime? terminatedAt, int suspendAfterDays, DateTime now)
    {
        if (expiresAt is null || suspendedAt is not null || terminatedAt is not null) return false;
        return expiresAt <= now.AddDays(-suspendAfterDays);
    }

    public static bool ShouldSendTerminationWarning(DateTime? expiresAt, DateTime? terminationWarningSentAt, DateTime? terminatedAt, int warningAfterDays, DateTime now)
    {
        if (expiresAt is null || terminationWarningSentAt is not null || terminatedAt is not null) return false;
        return expiresAt <= now.AddDays(-warningAfterDays);
    }

    public static bool ShouldTerminate(DateTime? expiresAt, DateTime? terminatedAt, int terminateAfterDays, DateTime now)
    {
        if (expiresAt is null || terminatedAt is not null) return false;
        return expiresAt <= now.AddDays(-terminateAfterDays);
    }

    // Chỉ có ý nghĩa trên item "đang sống" (RenewsFromItemId == null && ChangesFromItemId == null) -
    // caller trả về null cho item "biên lai" thay vì gọi hàm này (xem OrderRequestItemDto.FromEntity).
    public static string ComputeLifecycleStatus(DateTime? expiresAt, DateTime? suspendedAt, DateTime? terminatedAt, DateTime now)
    {
        if (terminatedAt is not null) return StatusTerminated;
        if (suspendedAt is not null) return StatusSuspended;
        if (expiresAt is not null && expiresAt <= now) return StatusOverdue;
        return StatusActive;
    }
}
