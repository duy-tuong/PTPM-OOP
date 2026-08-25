using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Admin.Identity.Customers.Dtos;

public class CustomerQueryParams : PaginationParams
{
    public string? Search { get; set; }

    // CRM: Hồ sơ B2B & Sales Rep (Đợt 2, Phần 10).
    public CustomerType? CustomerType { get; set; }
    public Guid? AssignedSalesRepUserId { get; set; }
}
