namespace CloudServiceStore.Application.Features.Admin.Content.Faqs.Dtos;

public class AdminFaqDto
{
    public int Id { get; init; }
    public string Question { get; init; } = string.Empty;
    public string Answer { get; init; } = string.Empty;
    public int? ServiceCategoryId { get; init; }
    public int DisplayOrder { get; init; }
    public bool IsActive { get; init; }
}
