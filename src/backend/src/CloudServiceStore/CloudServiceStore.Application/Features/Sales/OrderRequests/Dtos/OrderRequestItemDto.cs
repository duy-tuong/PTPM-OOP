using CloudServiceStore.Domain.Entities.Sales;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

// Dùng chung cho response cả khách hàng (MyOrderRequestDto) và Admin (AdminOrderRequestDto).
public class OrderRequestItemDto
{
    public int Id { get; init; }
    public int? ServicePlanId { get; init; }
    public string? ServicePlanName { get; init; }
    public int? TldPricingId { get; init; }
    public string? TldName { get; init; }
    public string? DomainName { get; init; }
    public int? PeriodMonths { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal LineTotal { get; init; }

    public static OrderRequestItemDto FromEntity(OrderRequestItem item) => new()
    {
        Id = item.Id,
        ServicePlanId = item.ServicePlanId,
        ServicePlanName = item.ServicePlan?.Name,
        TldPricingId = item.TldPricingId,
        TldName = item.TldPricing?.Tld,
        DomainName = item.DomainName,
        PeriodMonths = item.PeriodMonths,
        Quantity = item.Quantity,
        UnitPrice = item.UnitPrice,
        LineTotal = item.LineTotal
    };
}
