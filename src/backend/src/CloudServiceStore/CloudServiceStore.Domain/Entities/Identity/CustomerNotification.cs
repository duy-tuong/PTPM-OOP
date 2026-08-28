namespace CloudServiceStore.Domain.Entities.Identity;

// Thông báo trong app cho khách hàng (chuông thông báo ở Navbar) - tạo ra bởi NotificationOrderObserver
// (đơn hàng) / NotificationConsultationObserver (yêu cầu tư vấn) mỗi khi Admin/Editor đổi trạng thái tới
// 1 mốc có ý nghĩa (mirror đúng danh sách trạng thái CÓ gửi email - xem 2 observer đó, không tạo thông
// báo cho trạng thái không notifiable để tránh làm phiền khách bằng cả 2 kênh cho việc chưa "chắc
// chắn"). CHỈ tạo khi biết chắc CustomerId thật (khách đặt hàng/gửi tư vấn có tài khoản) - khách vãng
// lai (CustomerId null trên OrderRequest/ConsultationRequest) không có "hộp thư" nào để nhận, vẫn chỉ
// được báo qua email như cũ.
public class CustomerNotification
{
    public long Id { get; set; }

    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    // Đường dẫn khách bấm vào để xem chi tiết (vd /khach-hang/don-hang, /khach-hang/yeu-cau-tu-van) -
    // nullable vì không phải thông báo nào cũng cần điều hướng.
    public string? LinkUrl { get; set; }

    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
