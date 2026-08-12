namespace CloudServiceStore.Application.Features.Admin.Sales.OrderRequests.Dtos;

public class AdminOrderRequestDto
{
    public int Id { get; init; }
    public string OrderCode { get; init; } = string.Empty;
    public string CustomerType { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public string CustomerEmail { get; init; } = string.Empty;
    public string CustomerPhone { get; init; } = string.Empty;
    public string? CompanyName { get; init; }
    public int? ServicePlanId { get; init; }
    public string? ServicePlanName { get; init; }
    public int? PeriodMonths { get; init; }
    public int Quantity { get; init; }
    public decimal TotalPrice { get; init; }
    public string? Note { get; init; }
    public string Status { get; init; } = string.Empty;
    public Guid? AssignedToUserId { get; init; }
    public string? AssignedToUserName { get; init; }
    public string? Source { get; init; }
    public DateTime CreatedAt { get; init; }
}
