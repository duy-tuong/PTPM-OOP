using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities.Sales;

public class AffiliateApplication
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? WebsiteUrl { get; set; }
    public string? PromotionPlan { get; set; }
    public AffiliateApplicationStatus Status { get; set; } = AffiliateApplicationStatus.Pending;

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public Guid? ReviewedByUserId { get; set; }
    public AppUser? ReviewedByUser { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewNote { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
