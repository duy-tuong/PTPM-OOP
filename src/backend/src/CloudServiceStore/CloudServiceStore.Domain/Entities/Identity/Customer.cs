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
    public string Phone { get; set; } = string.Empty;
    public CustomerType CustomerType { get; set; } = CustomerType.Individual;
    public string? CompanyName { get; set; }
    public string? TaxCode { get; set; }

    public bool IsEmailVerified { get; set; }
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
}
