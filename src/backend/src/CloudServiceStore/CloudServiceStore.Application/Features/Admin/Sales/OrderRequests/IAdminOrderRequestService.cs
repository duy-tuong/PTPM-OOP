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

    // Gán/gỡ người phụ trách thủ công (Đợt 10, Phần 1).
    Task<AdminOrderRequestDto> AssignAsync(int id, AssignOrderRequestDto dto, CancellationToken cancellationToken = default);

    // Gỡ cờ Fraud Review thủ công sau khi Admin đã xác minh đơn không gian lận (Đợt 10, Phần 2).
    Task<AdminOrderRequestDto> ClearFraudFlagAsync(int id, CancellationToken cancellationToken = default);
}
