using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Services;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests;

public class OrderRequestStatusTransitionService : IOrderRequestStatusTransitionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly OrderStatusNotifier _orderStatusNotifier;
    private readonly IFakeProvisioningGenerator _fakeProvisioningGenerator;

    public OrderRequestStatusTransitionService(
        IUnitOfWork unitOfWork,
        OrderStatusNotifier orderStatusNotifier,
        IFakeProvisioningGenerator fakeProvisioningGenerator)
    {
        _unitOfWork = unitOfWork;
        _orderStatusNotifier = orderStatusNotifier;
        _fakeProvisioningGenerator = fakeProvisioningGenerator;
    }

    public async Task<OrderRequest> TransitionAsync(
        int orderRequestId,
        OrderRequestStatus newStatus,
        Guid? changedByUserId,
        CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<OrderRequest, int>();

        var entity = await repository.Query()
            .Include(o => o.Items).ThenInclude(i => i.ServicePlan)
            .Include(o => o.Items).ThenInclude(i => i.TldPricing)
            .Include(o => o.AssignedToUser)
            .FirstOrDefaultAsync(o => o.Id == orderRequestId, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(OrderRequest), orderRequestId);
        }

        var oldStatus = entity.Status;
        if ((oldStatus == OrderRequestStatus.Completed || oldStatus == OrderRequestStatus.Cancelled)
            && newStatus != oldStatus)
        {
            throw new ValidationException("Đơn hàng đã ở trạng thái kết thúc (Hoàn tất/Đã huỷ), không thể chuyển sang trạng thái khác.");
        }

        var now = DateTime.UtcNow;
        entity.Status = newStatus;
        entity.UpdatedAt = now;
        entity.AssignedToUserId ??= changedByUserId;

        // Mốc thời gian riêng cho OrderAutoProvisioningBackgroundService (Tier 3) tính độ trễ tự động -
        // luôn ghi đè (không ??=) để phản ánh đúng "lần gần nhất vào trạng thái này".
        if (newStatus == OrderRequestStatus.Paid)
        {
            entity.PaidAt = now;
        }
        else if (newStatus == OrderRequestStatus.Provisioning)
        {
            entity.ProvisioningStartedAt = now;
        }
        else if (newStatus == OrderRequestStatus.Completed)
        {
            await ApplyCompletionEffectsAsync(entity, now, cancellationToken);
        }

        repository.Update(entity);

        // Observer pattern: AuditLogOrderObserver/EmailOrderObserver tự thêm việc vào cùng UnitOfWork -
        // chỉ SaveChanges 1 lần dưới đây để gộp chung transaction. changedByUserId=null (đường đi từ
        // BackgroundService, Tier 3) vẫn hợp lệ - AuditLog.UserId vốn đã nullable.
        await _orderStatusNotifier.NotifyAsync(entity.Id, oldStatus, newStatus, changedByUserId, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return entity;
    }

    // Áp dụng hiệu ứng lúc đơn chuyển Completed cho từng dòng - 2 nhánh:
    // - Item THƯỜNG (RenewsFromItemId null): sinh thông tin bàn giao giả lập (gói dịch vụ nhận
    //   IP+mật khẩu root, tên miền nhận nameserver) + tính ExpiresAt lần đầu.
    // - Item GIA HẠN (RenewsFromItemId có giá trị, Tier 4): KHÔNG sinh credential mới - chỉ gia hạn
    //   ExpiresAt của item GỐC, cộng dồn từ thời điểm muộn hơn giữa "bây giờ" và ExpiresAt hiện tại
    //   (gia hạn trước hạn thì cộng dồn đúng phần còn lại; gia hạn sau khi đã hết hạn thì tính từ hôm
    //   nay, không cấp lùi ngày miễn phí cho thời gian đã hết hạn).
    // Không cần kiểm tra "chỉ hiện khi Completed" ở tầng DTO: field chỉ được ghi ở đây, và guard trạng
    // thái kết thúc phía trên không cho phép rời khỏi Completed sau khi đã vào.
    private async Task ApplyCompletionEffectsAsync(OrderRequest order, DateTime now, CancellationToken cancellationToken)
    {
        var itemRepository = _unitOfWork.Repository<OrderRequestItem, int>();

        foreach (var item in order.Items)
        {
            // Đổi gói (Upgrade có phụ thu) - item này là "biên lai đổi gói" (xem PlanChangeService),
            // ServicePlanId/PlanPriceId của nó là gói ĐÍCH. Áp dụng đổi gói lên item GỐC: đổi
            // ServicePlanId/PlanPriceId/UnitPrice/LineTotal theo giá ĐẦY ĐỦ của gói đích (không phải
            // UnitPrice của item này - đó là số tiền phụ thu proration), GIỮ NGUYÊN ExpiresAt.
            if (item.ChangesFromItemId is not null)
            {
                var original = await itemRepository.Query()
                    .FirstOrDefaultAsync(i => i.Id == item.ChangesFromItemId, cancellationToken);

                if (original is not null && item.PlanPriceId is not null)
                {
                    var newPrice = await _unitOfWork.Repository<PlanPrice, int>().GetByIdAsync(item.PlanPriceId.Value, cancellationToken);
                    if (newPrice is not null)
                    {
                        var newUnitPrice = newPrice.PromotionalPrice ?? newPrice.Price;
                        original.ServicePlanId = item.ServicePlanId;
                        original.PlanPriceId = item.PlanPriceId;
                        original.UnitPrice = newUnitPrice;
                        original.LineTotal = newUnitPrice * original.Quantity;
                        // Dunning (Phần 8) - khách vừa trả tiền đổi gói, khôi phục dịch vụ nếu đang bị
                        // tạm khóa/cảnh báo (PlanChangeService.ValidateAndComputeAsync đã chặn đổi gói
                        // khi TerminatedAt != null nên không cần reset field đó ở đây).
                        original.SuspendedAt = null;
                        original.TerminationWarningSentAt = null;
                        itemRepository.Update(original);
                    }
                }

                item.ProvisionedAt = now;
                continue;
            }

            if (item.RenewsFromItemId is not null)
            {
                var original = await itemRepository.Query()
                    .FirstOrDefaultAsync(i => i.Id == item.RenewsFromItemId, cancellationToken);

                if (original is not null)
                {
                    var extendFrom = original.ExpiresAt is not null && original.ExpiresAt > now ? original.ExpiresAt.Value : now;
                    original.ExpiresAt = item.ServicePlanId is not null
                        ? extendFrom.AddMonths(item.PeriodMonths ?? 0)
                        : extendFrom.AddYears(item.Quantity);
                    // Dunning (Phần 8) - khách vừa trả tiền gia hạn, khôi phục dịch vụ nếu đang bị tạm
                    // khóa/cảnh báo (OrderRequestService.CreateRenewalAsync đã chặn gia hạn khi
                    // TerminatedAt != null nên không cần reset field đó ở đây).
                    original.SuspendedAt = null;
                    original.TerminationWarningSentAt = null;
                    itemRepository.Update(original);
                }

                item.ProvisionedAt = now;
                continue;
            }

            if (item.ServicePlanId is not null)
            {
                var (ipAddress, rootPassword) = _fakeProvisioningGenerator.GenerateServerCredentials(hasSshKey: item.SshPublicKeySnapshot is not null);
                item.ProvisionedIpAddress = ipAddress;
                item.ProvisionedRootPassword = rootPassword;
                item.ExpiresAt = now.AddMonths(item.PeriodMonths ?? 0);
            }
            else
            {
                item.ProvisionedNameservers = _fakeProvisioningGenerator.GenerateNameservers();
                item.ExpiresAt = now.AddYears(item.Quantity);
            }

            item.ProvisionedAt = now;
        }
    }
}
