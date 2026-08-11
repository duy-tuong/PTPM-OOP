namespace CloudServiceStore.Application.Features.Content.Faqs.Dtos;

public class FaqDto
{
    public int Id { get; init; }
    public string Question { get; init; } = string.Empty;
    public string Answer { get; init; } = string.Empty;
    public int? ServiceCategoryId { get; init; }
    public int DisplayOrder { get; init; }
}
