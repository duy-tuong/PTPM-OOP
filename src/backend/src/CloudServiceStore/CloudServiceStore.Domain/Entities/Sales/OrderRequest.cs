using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Entities.Marketing;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities.Sales;

public class OrderRequest
{
    public int Id { get; set; }
    public string OrderCode { get; set; } = string.Empty;

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public CustomerType CustomerType { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? TaxCode { get; set; }

    public int? ServicePlanId { get; set; }
    public ServicePlan? ServicePlan { get; set; }

    public int? TldPricingId { get; set; }
    public TldPricing? TldPricing { get; set; }
    public string? DomainName { get; set; }

    public int? PeriodMonths { get; set; }

    public int? PromotionId { get; set; }
    public Promotion? Promotion { get; set; }

    public int Quantity { get; set; } = 1;
    public decimal TotalPrice { get; set; }
    public string? Note { get; set; }
    public OrderRequestStatus Status { get; set; } = OrderRequestStatus.New;

    public Guid? AssignedToUserId { get; set; }
    public AppUser? AssignedToUser { get; set; }

    public string? Source { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
