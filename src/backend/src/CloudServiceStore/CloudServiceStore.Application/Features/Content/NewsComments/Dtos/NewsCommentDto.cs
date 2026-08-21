namespace CloudServiceStore.Application.Features.Content.NewsComments.Dtos;

// DTO công khai - KHÔNG lộ AuthorEmail (chặt hơn AdminNewsCommentDto vốn chỉ ẩn khi có CustomerId).
// Replies dựng cây lồng nhau qua NewsCommentService.GetForArticleAsync.
public class NewsCommentDto
{
    public int Id { get; set; }
    public int? ParentCommentId { get; set; }
    public string AuthorDisplayName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<NewsCommentDto> Replies { get; set; } = new();
}
