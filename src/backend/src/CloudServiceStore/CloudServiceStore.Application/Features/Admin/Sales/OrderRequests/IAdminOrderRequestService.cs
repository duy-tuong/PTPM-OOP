using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Sales.OrderRequests.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Sales.OrderRequests;

public interface IAdminOrderRequestService
{
    Task<PagedResult<AdminOrderRequestDto>> GetListAsync(OrderRequestQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminOrderRequestDto> UpdateStatusAsync(int id, UpdateOrderRequestStatusDto dto, Guid changedByUserId, CancellationToken cancellationToken = default);

    // Dunning Automation (Phần 8) - Admin gỡ tạm khóa thủ công khi xác nhận đã nhận tiền ngoài luồng tự
    // động (vd chuyển khoản không qua PayOS). itemId là OrderRequestItem.Id (không phải OrderRequest.Id).
    Task<AdminOrderRequestDto> LiftSuspensionAsync(int itemId, CancellationToken cancellationToken = default);
}
