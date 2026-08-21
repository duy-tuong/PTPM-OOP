using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Sales.OrderRequests.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Sales.OrderRequests;

public interface IAdminOrderRequestService
{
    Task<PagedResult<AdminOrderRequestDto>> GetListAsync(OrderRequestQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminOrderRequestDto> UpdateStatusAsync(int id, UpdateOrderRequestStatusDto dto, Guid changedByUserId, CancellationToken cancellationToken = default);
}
