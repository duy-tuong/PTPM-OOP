namespace CloudServiceStore.Application.Features.Admin.Content.ContentPages.Dtos;

public class AdminContentPageDto
{
    public int Id { get; init; }
    public string Slug { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
    public string? MetaTitle { get; init; }
    public string? MetaDescription { get; init; }
    public Guid AuthorId { get; init; }
    public bool IsPublished { get; init; }
    public DateTime? PublishedAt { get; init; }
    public int DisplayOrder { get; init; }
}
