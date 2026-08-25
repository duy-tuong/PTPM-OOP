namespace CloudServiceStore.Application.Features.Admin.Identity.Customers.Dtos;

public class AdminCustomerDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string Phone { get; init; } = string.Empty;
    public string CustomerType { get; init; } = string.Empty;
    public string? CompanyName { get; init; }
    public string? TaxCode { get; init; }
    public bool IsEmailVerified { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }

    // CRM: Hồ sơ B2B & Sales Rep (Đợt 2, Phần 10).
    public string? BillingAddress { get; init; }
    public string? LegalRepresentativeName { get; init; }
    public string? BusinessLicenseNumber { get; init; }
    public decimal? CreditLimit { get; init; }
    public Guid? AssignedSalesRepUserId { get; init; }
    public string? AssignedSalesRepUserName { get; init; }
}
