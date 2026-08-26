namespace CloudServiceStore.Application.Features.Content.NewsTags.Dtos;

public class NewsTagDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public int ArticleCount { get; init; }
}
