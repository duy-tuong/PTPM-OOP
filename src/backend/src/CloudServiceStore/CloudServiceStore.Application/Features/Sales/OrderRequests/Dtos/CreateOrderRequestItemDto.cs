using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

public class CreateOrderRequestItemDto
{
    public int? ServicePlanId { get; set; }

    public int? TldPricingId { get; set; }

    [MaxLength(100)]
    public string? DomainName { get; set; }

    public int? PeriodMonths { get; set; }

    [Range(1, 100)]
    public int Quantity { get; set; } = 1;
}
