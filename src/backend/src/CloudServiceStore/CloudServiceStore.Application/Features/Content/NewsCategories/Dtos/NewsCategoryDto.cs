namespace CloudServiceStore.Application.Features.Content.NewsCategories.Dtos;

public class NewsCategoryDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int DisplayOrder { get; init; }
}
