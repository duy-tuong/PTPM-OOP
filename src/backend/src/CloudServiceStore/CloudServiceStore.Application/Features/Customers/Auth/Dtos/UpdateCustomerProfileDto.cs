using System.ComponentModel.DataAnnotations;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Customers.Auth.Dtos;

// Không có Email - đổi email cần luồng xác thực riêng (Customer đã có sẵn EmailVerificationToken cho
// mục đích này nhưng chưa được dùng ở đâu cả), ngoài phạm vi tính năng hồ sơ tự phục vụ này.
public class UpdateCustomerProfileDto
{
    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required, EnumDataType(typeof(CustomerType))]
    public CustomerType CustomerType { get; set; }

    [MaxLength(150)]
    public string? CompanyName { get; set; }

    [MaxLength(20)]
    public string? TaxCode { get; set; }
}
