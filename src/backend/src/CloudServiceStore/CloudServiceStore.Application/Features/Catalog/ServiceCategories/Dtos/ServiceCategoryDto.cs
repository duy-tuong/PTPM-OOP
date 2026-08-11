namespace CloudServiceStore.Application.Features.Catalog.ServiceCategories.Dtos;

public class ServiceCategoryDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? IconUrl { get; init; }
    public int DisplayOrder { get; init; }
}
