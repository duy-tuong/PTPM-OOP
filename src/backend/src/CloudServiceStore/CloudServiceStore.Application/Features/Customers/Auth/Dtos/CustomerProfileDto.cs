namespace CloudServiceStore.Application.Features.Customers.Auth.Dtos;

// CustomerType là chuỗi tên enum (map ở service qua .ToString()) - khớp convention đọc dữ liệu đã
// dùng cho mọi DTO khác trong dự án (vd AdminCustomerDto, AdminOrderRequestDto.Status) vì backend
// chưa cấu hình JsonStringEnumConverter cho enum ghi trực tiếp.
public class CustomerProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string CustomerType { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? TaxCode { get; set; }
    public bool IsEmailVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
