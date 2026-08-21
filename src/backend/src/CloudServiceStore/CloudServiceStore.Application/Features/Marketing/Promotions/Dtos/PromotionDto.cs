namespace CloudServiceStore.Application.Features.Marketing.Promotions.Dtos;

public class PromotionDto
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
}
