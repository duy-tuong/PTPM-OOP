using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Sales.OrderRequests;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;


namespace CloudServiceStore.Infrastructure.BackgroundServices;


// Đợt 13, Phần 3 (C2) - đơn ở trạng thái "New" (chưa hề được Admin liên hệ, chưa thanh toán) không tự
// biến mất nếu khách bỏ ngang - service này quét và tự huỷ sau StaleOrderCancelAfterDays (mặc định 3
// ngày, xem IAppSettings). CHỈ áp dụng cho New - Contacted/Confirmed nghĩa là Admin đã bắt đầu can
// thiệp, không nên tự động huỷ mà thiếu phán đoán con người. Poll mỗi 1 giờ (không cần nhanh như
// Dunning/AutoProvisioning - đây không phải dịch vụ khách đang chờ). Mirror đúng cấu trúc
// DunningBackgroundService/OrderAutoProvisioningBackgroundService: mỗi tick tạo 1 scope mới, expose
// IsDue() dạng pure-function để unit-test.
public class StaleOrderCleanupBackgroundService : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromHours(1);


    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IAppSettings _appSettings;
    private readonly ILogger<StaleOrderCleanupBackgroundService> _logger;


    public StaleOrderCleanupBackgroundService(
        IServiceScopeFactory scopeFactory,
        IAppSettings appSettings,
        ILogger<StaleOrderCleanupBackgroundService> logger)
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
                await ProcessStaleOrdersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi quét đơn hàng \"New\" quá hạn để tự động huỷ (Đợt 13, C2)");
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


    private async Task ProcessStaleOrdersAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var transitionService = scope.ServiceProvider.GetRequiredService<IOrderRequestStatusTransitionService>();
        var repository = unitOfWork.Repository<OrderRequest, int>();
        var now = DateTime.UtcNow;


        // IsDue() bên dưới là bản pure-function tương đương để unit-test - điều kiện ở đây viết lại
        // dạng biểu thức vì LINQ-to-Entities không dịch được lời gọi hàm C# tuỳ ý trong .Where().
        var staleOrderIds = await repository.Query()
            .Where(o => o.Status == OrderRequestStatus.New
                && o.CreatedAt <= now.AddDays(-_appSettings.StaleOrderCancelAfterDays))
            .Select(o => o.Id)
            .ToListAsync(cancellationToken);


        foreach (var orderId in staleOrderIds)
        {
            try
            {
                // changedByUserId: null - hệ thống tự huỷ, không phải Admin bấm tay. Dùng chung
                // TransitionAsync (không tự viết SaveChanges/email riêng) để Observer pattern
                // (audit log + email + notification) chạy nhất quán với mọi luồng huỷ đơn khác.
                await transitionService.TransitionAsync(orderId, OrderRequestStatus.Cancelled, changedByUserId: null, cancellationToken);
            }
            catch (Exception ex)
            {
                // 1 đơn lỗi (vd bị Admin xử lý đúng lúc tick đang chạy) không được chặn các đơn còn lại.
                _logger.LogError(ex, "Tự động huỷ đơn quá hạn #{OrderId} thất bại", orderId);
            }
        }
    }


    // Tách riêng để unit-test được - BackgroundService.ExecuteAsync (vòng lặp vô hạn + Task.Delay
    // thật) không test trực tiếp một cách thực tế.
    public static bool IsDue(DateTime createdAt, int cancelAfterDays, DateTime now) =>
        createdAt <= now.AddDays(-cancelAfterDays);
}

