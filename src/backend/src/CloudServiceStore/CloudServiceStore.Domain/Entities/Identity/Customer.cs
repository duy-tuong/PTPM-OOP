using CloudServiceStore.Domain.Common;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities.Identity;

public class Customer : ISoftDelete
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public int RoleId { get; set; }
    public AppRole Role { get; set; } = null!;

    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public CustomerType CustomerType { get; set; } = CustomerType.Individual;
    public string? CompanyName { get; set; }
    public string? TaxCode { get; set; }

    public bool IsEmailVerified { get; set; }
    public string? PendingEmail { get; set; }
    public string? EmailVerificationToken { get; set; }
    public DateTime? EmailVerificationExpiry { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetExpiry { get; set; }

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // CRM: Hồ sơ B2B & Sales Rep (Đợt 2, Phần 10) - tất cả nullable, không bắt buộc, chỉ có ý nghĩa
    // tham khảo cho Sales, không có logic nghiệp vụ nào phụ thuộc vào chúng.
    public string? BillingAddress { get; set; }
    public string? LegalRepresentativeName { get; set; }
    public string? BusinessLicenseNumber { get; set; }

    // Chỉ mang tính hiển thị/tham khảo cho Sales - KHÔNG có logic enforce nào (hệ thống vẫn 100% trả
    // trước qua PayOS, không có công nợ thật). Đừng dùng field này để chặn/giới hạn bất cứ luồng nào.
    public decimal? CreditLimit { get; set; }

    // Gán Sales phụ trách DÀI HẠN cho tài khoản khách hàng - khác OrderRequest.AssignedToUserId vốn là
    // gán theo TỪNG ĐƠN (có thể đổi người phụ trách khác nhau qua từng đơn của cùng 1 khách).
    public Guid? AssignedSalesRepUserId { get; set; }
    public AppUser? AssignedSalesRepUser { get; set; }

    // SSH Key lưu theo tài khoản (Đợt 3, Phần 12) - xem CustomerSshKey.cs.
    public ICollection<CustomerSshKey> SshKeys { get; set; } = new List<CustomerSshKey>();

    // Thông báo trong app (chuông ở Navbar) - xem CustomerNotification.cs.
    public ICollection<CustomerNotification> Notifications { get; set; } = new List<CustomerNotification>();
}
