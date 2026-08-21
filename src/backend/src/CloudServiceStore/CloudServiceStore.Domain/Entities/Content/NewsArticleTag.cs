namespace CloudServiceStore.Domain.Entities.Content;

public class NewsArticleTag
{
    public int NewsArticleId { get; set; }
    public NewsArticle NewsArticle { get; set; } = null!;

    public int TagId { get; set; }
    public NewsTag Tag { get; set; } = null!;
}
