using System.ComponentModel.DataAnnotations;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

public class CreateOrderRequestDto
{
    [Required]
    [EnumDataType(typeof(CustomerType))]
    public CustomerType CustomerType { get; set; }

    [Required, MaxLength(150)]
    public string CustomerName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(100)]
    public string CustomerEmail { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string CustomerPhone { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? CompanyName { get; set; }

    [MaxLength(50)]
    public string? TaxCode { get; set; }

    public int? PromotionId { get; set; }

    [MaxLength(1000)]
    public string? Note { get; set; }

    [Required, MinLength(1)]
    public List<CreateOrderRequestItemDto> Items { get; set; } = new();
}
