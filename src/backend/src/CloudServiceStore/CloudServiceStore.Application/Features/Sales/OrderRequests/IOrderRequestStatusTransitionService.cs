using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests;

// Lõi chuyển trạng thái đơn hàng dùng chung cho 2 caller: AdminOrderRequestService.UpdateStatusAsync
// (Admin bấm tay qua HTTP, luôn có changedByUserId) và OrderAutoProvisioningBackgroundService (hệ
// thống tự chuyển, changedByUserId = null). Trả về entity đã track (không phải DTO) vì 2 caller map
// sang response shape khác nhau (AdminOrderRequestDto vs. không cần map gì cả).
public interface IOrderRequestStatusTransitionService
{
    Task<OrderRequest> TransitionAsync(
        int orderRequestId,
        OrderRequestStatus newStatus,
        Guid? changedByUserId,
        CancellationToken cancellationToken = default);
}
