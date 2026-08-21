using CloudServiceStore.Application.Common.Models;

namespace CloudServiceStore.Application.Features.Admin.Identity.Customers.Dtos;

public class CustomerQueryParams : PaginationParams
{
    public string? Search { get; set; }
}
