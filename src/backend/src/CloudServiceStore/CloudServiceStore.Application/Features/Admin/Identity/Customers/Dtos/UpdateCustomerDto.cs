namespace CloudServiceStore.Application.Features.Admin.Identity.Customers.Dtos;

// CRM: Hồ sơ B2B & Sales Rep (Đợt 2, Phần 10) - tất cả field đều tuỳ chọn (nullable), Admin chỉ điền
// những gì cần thiết cho khách B2B. AssignedSalesRepUserId = null nghĩa là "bỏ gán" (không phải "không
// đổi") - PUT luôn ghi đè toàn bộ field trong DTO này, đúng ngữ nghĩa PUT chuẩn REST.
public class UpdateCustomerDto
{
    public string? BillingAddress { get; set; }
    public string? LegalRepresentativeName { get; set; }
    public string? BusinessLicenseNumber { get; set; }
    public decimal? CreditLimit { get; set; }
    public Guid? AssignedSalesRepUserId { get; set; }
}
