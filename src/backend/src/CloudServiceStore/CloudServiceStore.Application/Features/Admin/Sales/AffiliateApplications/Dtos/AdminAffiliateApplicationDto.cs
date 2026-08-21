namespace CloudServiceStore.Application.Features.Admin.Sales.AffiliateApplications.Dtos;

public class AdminAffiliateApplicationDto
{
    public int Id { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Phone { get; init; } = string.Empty;
    public string? WebsiteUrl { get; init; }
    public string? PromotionPlan { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? ReviewedByUserName { get; init; }
    public DateTime? ReviewedAt { get; init; }
    public string? ReviewNote { get; init; }
    public DateTime CreatedAt { get; init; }
}
