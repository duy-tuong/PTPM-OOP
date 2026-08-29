namespace CloudServiceStore.Application.Features.Admin.Sales.OrderRequests.Dtos;

// Gán/gỡ người phụ trách đơn hàng (Đợt 10, Phần 1) - khác AssignedToUserId tự gán khi đổi trạng thái
// (xem OrderRequestStatusTransitionService.TransitionAsync), đây là Admin chủ động chọn tay. Null = bỏ
// gán (đơn quay về "Chưa gán").
public class AssignOrderRequestDto
{
    public Guid? AssignedToUserId { get; init; }
}
