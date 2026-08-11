using System.ComponentModel.DataAnnotations;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Sales.ConsultationRequests.Dtos;

public class CreateConsultationRequestDto
{
    [Required]
    [EnumDataType(typeof(CustomerType))]
    public CustomerType CustomerType { get; set; }

    [Required, MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? CompanyName { get; set; }

    public int? ServiceCategoryId { get; set; }

    [Required, MaxLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Message { get; set; } = string.Empty;
}
