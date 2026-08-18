namespace CloudServiceStore.Application.Features.Admin.Marketing.Promotions.Dtos;

// Giữ cả id lẫn tên - id để frontend prefill đúng <Select> khi Sửa, tên chỉ dùng hiển thị.
public class PromotionScopeDto
{
    public string ScopeType { get; init; } = string.Empty;
    public int? ServiceCategoryId { get; init; }
    public string? ServiceCategoryName { get; init; }
    public int? ServicePlanId { get; init; }
    public string? ServicePlanName { get; init; }
}
