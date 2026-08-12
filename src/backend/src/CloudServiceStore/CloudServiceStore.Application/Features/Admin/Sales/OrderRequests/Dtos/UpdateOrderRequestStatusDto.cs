using System.ComponentModel.DataAnnotations;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Admin.Sales.OrderRequests.Dtos;

public class UpdateOrderRequestStatusDto
{
    [Required, EnumDataType(typeof(OrderRequestStatus))]
    public OrderRequestStatus NewStatus { get; set; }
}
