namespace CloudServiceStore.Domain.Entities.Catalog;

public class PlanPrice
{
    public int Id { get; set; }

    public int PlanId { get; set; }
    public ServicePlan Plan { get; set; } = null!;

    public int PeriodMonths { get; set; }
    public decimal Price { get; set; }
    public decimal? PromotionalPrice { get; set; }
    public string Currency { get; set; } = "VND";
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
