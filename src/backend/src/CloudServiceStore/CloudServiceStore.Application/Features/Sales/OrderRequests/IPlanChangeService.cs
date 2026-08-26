using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests;

// Đổi gói (Upgrade/Downgrade) + Proration cho 1 dịch vụ ServicePlan đang sống (item, không phải TLD) -
// xem PlanChangeService cho toàn bộ chính sách/công thức.
public interface IPlanChangeService
{
    Task<PlanChangePreviewDto> PreviewChangeAsync(int itemId, int targetPlanId, Guid customerId, CancellationToken cancellationToken = default);

    Task<PlanChangeResultDto> RequestChangeAsync(int itemId, int targetPlanId, Guid customerId, CancellationToken cancellationToken = default);
}
