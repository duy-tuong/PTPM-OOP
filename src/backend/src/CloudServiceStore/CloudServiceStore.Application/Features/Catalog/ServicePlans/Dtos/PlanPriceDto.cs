namespace CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;

public class PlanPriceDto
{
    public int PeriodMonths { get; init; }
    public decimal Price { get; init; }
    public decimal? PromotionalPrice { get; init; }
    public string Currency { get; init; } = "VND";
    public bool IsDefault { get; init; }
}
