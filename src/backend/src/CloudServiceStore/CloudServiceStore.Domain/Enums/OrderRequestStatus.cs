namespace CloudServiceStore.Domain.Enums;

public enum OrderRequestStatus
{
    New = 1,
    Contacted = 2,
    Confirmed = 3,
    Paid = 4,
    Provisioning = 5,
    Cancelled = 6,
    Completed = 7
}
