using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Admin.Sales.OrderRequests.Dtos;

public class OrderRequestQueryParams : PaginationParams
{
    public OrderRequestStatus? Status { get; set; }
}
