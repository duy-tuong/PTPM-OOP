namespace CloudServiceStore.Domain.Entities.Content;

public class NewsTag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    public ICollection<NewsArticleTag> ArticleTags { get; set; } = new List<NewsArticleTag>();
}
