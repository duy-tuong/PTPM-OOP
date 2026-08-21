using System.ComponentModel.DataAnnotations;

namespace CloudServiceStore.Application.Features.Content.NewsComments.Dtos;

// AuthorName KHÔNG đánh dấu [Required] ở đây - khách đã đăng nhập không cần gửi field này (server tự
// lấy tên thật từ Customer, bỏ qua giá trị client gửi lên). Bắt buộc "phải có tên nếu là khách vãng lai"
// được validate thủ công trong NewsCommentService (DataAnnotations không hỗ trợ required-có-điều-kiện
// gọn gàng cho trường hợp này).
public class CreateNewsCommentDto
{
    [Required]
    public int NewsArticleId { get; set; }

    public int? ParentCommentId { get; set; }

    [MaxLength(100)]
    public string? AuthorName { get; set; }

    [EmailAddress]
    [MaxLength(255)]
    public string? AuthorEmail { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;
}
