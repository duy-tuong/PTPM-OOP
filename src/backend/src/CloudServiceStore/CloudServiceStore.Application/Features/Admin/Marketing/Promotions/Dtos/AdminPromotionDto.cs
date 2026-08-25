namespace CloudServiceStore.Application.Features.Admin.Marketing.Promotions.Dtos;

public class AdminPromotionDto
{
    public int Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string DiscountType { get; init; } = string.Empty;
    public decimal DiscountValue { get; init; }
    public decimal? MaxDiscountAmount { get; init; }
    public decimal? MinOrderValue { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public int? UsageLimit { get; init; }
    public int UsageCount { get; init; }
    public bool IsActive { get; init; }
    public string CustomerEligibility { get; init; } = string.Empty;
    public List<PromotionScopeDto> Scopes { get; init; } = new();
}
