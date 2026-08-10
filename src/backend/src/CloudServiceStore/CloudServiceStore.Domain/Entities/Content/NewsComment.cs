using CloudServiceStore.Domain.Entities.Identity;

namespace CloudServiceStore.Domain.Entities.Content;

public class NewsComment
{
    public int Id { get; set; }

    public int NewsArticleId { get; set; }
    public NewsArticle NewsArticle { get; set; } = null!;

    public int? ParentCommentId { get; set; }
    public NewsComment? ParentComment { get; set; }

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public string? AuthorName { get; set; }
    public string? AuthorEmail { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<NewsComment> Replies { get; set; } = new List<NewsComment>();
}
