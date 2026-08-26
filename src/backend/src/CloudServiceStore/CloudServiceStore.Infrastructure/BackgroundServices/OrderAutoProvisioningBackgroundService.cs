using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Sales.OrderRequests;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.BackgroundServices;

// Tier 3 "mô phỏng cấp phát tự động" - Admin chỉ cần xác nhận đã nhận tiền (chuyển đơn sang Paid),
// service này tự chuyển tiếp Paid->Provisioning->Completed sau 1 khoảng trễ cấu hình được
// (IAppSettings.ProvisioningDelaySeconds/ProvisioningCompletionDelaySeconds) - không cần Admin bấm
// tay thêm bước nào. Mỗi tick tạo 1 scope mới (mirror đúng pattern
// `using (var scope = app.Services.CreateScope())` đã có ở Program.cs) vì IUnitOfWork/
// IOrderRequestStatusTransitionService đều đăng ký Scoped, không resolve trực tiếp được từ Singleton.
public class OrderAutoProvisioningBackgroundService : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(5);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IAppSettings _appSettings;
    private readonly ILogger<OrderAutoProvisioningBackgroundService> _logger;

    public OrderAutoProvisioningBackgroundService(
        IServiceScopeFactory scopeFactory,
        IAppSettings appSettings,
        ILogger<OrderAutoProvisioningBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _appSettings = appSettings;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessDueOrdersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi quét đơn hàng tự động chuyển trạng thái (Tier 3)");
            }

            try
            {
                await Task.Delay(PollInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Ứng dụng đang tắt - thoát vòng lặp êm, không log lỗi.
            }
        }
    }

    private async Task ProcessDueOrdersAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var transitionService = scope.ServiceProvider.GetRequiredService<IOrderRequestStatusTransitionService>();
        var repository = unitOfWork.Repository<OrderRequest, int>();
        var now = DateTime.UtcNow;

        // IsDue() bên dưới là bản pure-function tương đương để unit-test - LINQ-to-Entities không dịch
        // được lời gọi hàm C# tuỳ ý trong .Where(), nên điều kiện ở đây phải viết lại dạng biểu thức.
        // IsFlaggedForReview (Fraud Review, Phần 9) - đơn nghi vấn KHÔNG được tự động chuyển
        // Paid->Provisioning, phải chờ Admin duyệt tay qua AdminOrderRequestService.UpdateStatusAsync.
        var duePaidOrderIds = await repository.Query()
            .Where(o => o.Status == OrderRequestStatus.Paid
                && o.PaidAt != null
                && o.PaidAt <= now.AddSeconds(-_appSettings.ProvisioningDelaySeconds)
                && !o.IsFlaggedForReview)
            .Select(o => o.Id)
            .ToListAsync(cancellationToken);

        foreach (var orderId in duePaidOrderIds)
        {
            await TryTransitionAsync(transitionService, orderId, OrderRequestStatus.Provisioning, cancellationToken);
        }

        var dueProvisioningOrderIds = await repository.Query()
            .Where(o => o.Status == OrderRequestStatus.Provisioning
                && o.ProvisioningStartedAt != null
                && o.ProvisioningStartedAt <= now.AddSeconds(-_appSettings.ProvisioningCompletionDelaySeconds))
            .Select(o => o.Id)
            .ToListAsync(cancellationToken);

        foreach (var orderId in dueProvisioningOrderIds)
        {
            await TryTransitionAsync(transitionService, orderId, OrderRequestStatus.Completed, cancellationToken);
        }
    }

    private async Task TryTransitionAsync(
        IOrderRequestStatusTransitionService transitionService,
        int orderId,
        OrderRequestStatus newStatus,
        CancellationToken cancellationToken)
    {
        try
        {
            // changedByUserId: null - đơn được hệ thống tự chuyển, không phải Admin bấm tay.
            await transitionService.TransitionAsync(orderId, newStatus, changedByUserId: null, cancellationToken);
        }
        catch (Exception ex)
        {
            // 1 đơn lỗi (vd bị Admin huỷ đúng lúc tick đang chạy) không được chặn các đơn còn lại.
            _logger.LogError(ex, "Tự động chuyển đơn #{OrderId} sang {NewStatus} thất bại", orderId, newStatus);
        }
    }

    // Tách riêng để unit-test được - BackgroundService.ExecuteAsync (vòng lặp vô hạn + Task.Delay
    // thật) không test trực tiếp một cách thực tế.
    public static bool IsDue(DateTime enteredAt, int delaySeconds, DateTime now) =>
        enteredAt <= now.AddSeconds(-delaySeconds);
}
