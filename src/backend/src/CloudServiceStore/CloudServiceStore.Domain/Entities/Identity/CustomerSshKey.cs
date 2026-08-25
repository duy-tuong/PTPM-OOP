namespace CloudServiceStore.Domain.Entities.Identity;

// SSH Public Key lưu theo tài khoản khách hàng (Đợt 3, Phần 12) - tái sử dụng được qua nhiều đơn hàng
// khác nhau (mirror thông lệ Vultr/DigitalOcean). Nội dung key được SNAPSHOT sang OrderRequestItem tại
// thời điểm mua (xem OrderRequestItem.SshPublicKeySnapshot) - không có FK ngược từ đơn hàng về đây, nên
// khách xoá key khỏi tài khoản KHÔNG ảnh hưởng đơn đã tạo trước đó, và có thể xoá tự do.
public class CustomerSshKey
{
    public int Id { get; set; }

    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    // Tên gợi nhớ do khách tự đặt, vd "Laptop cá nhân".
    public string Label { get; set; } = string.Empty;
    public string PublicKey { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
