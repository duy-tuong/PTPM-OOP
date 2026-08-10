using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities.Sales;

public class ConsultationRequest
{
    public int Id { get; set; }
    public string RequestCode { get; set; } = string.Empty;

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public CustomerType CustomerType { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? CompanyName { get; set; }

    public int? ServiceCategoryId { get; set; }
    public ServiceCategory? ServiceCategory { get; set; }

    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public ConsultationStatus Status { get; set; } = ConsultationStatus.New;

    public Guid? AssignedToUserId { get; set; }
    public AppUser? AssignedToUser { get; set; }

    public string? Source { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
