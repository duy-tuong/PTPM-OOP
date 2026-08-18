namespace CloudServiceStore.Application.Features.Admin.Content.NewsComments.Dtos;

public class AdminNewsCommentDto
{
    public int Id { get; init; }
    public int NewsArticleId { get; init; }
    public string NewsArticleTitle { get; init; } = string.Empty;
    public int? ParentCommentId { get; init; }

    // Ưu tiên tên khách hàng đã đăng nhập (Customer.FullName), fallback về AuthorName của khách ẩn danh
    // - tách riêng khỏi field gốc AuthorName để tránh nhầm lẫn đây là giá trị đã map sẵn.
    public string AuthorDisplayName { get; init; } = string.Empty;
    public string? AuthorEmail { get; init; }

    public string Content { get; init; } = string.Empty;
    public bool IsApproved { get; init; }
    public DateTime CreatedAt { get; init; }
}
