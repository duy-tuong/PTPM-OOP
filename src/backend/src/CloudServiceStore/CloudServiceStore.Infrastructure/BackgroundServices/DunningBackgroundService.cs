using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.BackgroundServices;

// Dunning Automation (Đợt 2, Phần 8) - Nhắc hạn (Tier 4, RenewalReminderBackgroundService) đã có từ
// trước, service này tiếp nối SAU khi dịch vụ đã hết hạn (ExpiresAt < now) mà khách chưa gia hạn: quét
// theo 3 mốc T+SuspendAfterDays -> T+TerminationWarningAfterDays -> T+TerminateAfterDays (mặc định
// 3/7/14 ngày, xem IAppSettings). KHÔNG dùng enum Status riêng - trạng thái vòng đời suy ra từ
// SuspendedAt/TerminationWarningSentAt/TerminatedAt + ExpiresAt (xem DunningPolicy). Mỗi tick tạo 1
// scope mới, mirror đúng pattern RenewalReminderBackgroundService/OrderAutoProvisioningBackgroundService.
public class DunningBackgroundService : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromMinutes(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IAppSettings _appSettings;
    private readonly ILogger<DunningBackgroundService> _logger;

    public DunningBackgroundService(
        IServiceScopeFactory scopeFactory,
        IAppSettings appSettings,
        ILogger<DunningBackgroundService> logger)
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
                await ProcessDunningAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi quét dịch vụ quá hạn để xử lý Dunning Automation (Phần 8)");
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

    private async Task ProcessDunningAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
        var now = DateTime.UtcNow;

        // Chỉ item "đang sống" mới có vòng đời riêng để xử lý - mirror
        // RenewalReminderBackgroundService (RenewsFromItemId == null); ChangesFromItemId == null loại
        // thêm "biên lai đổi gói" (Phần 6) vốn cũng không có ExpiresAt riêng.
        await SuspendDueItemsAsync(unitOfWork, emailService, now, cancellationToken);
        await SendTerminationWarningsAsync(unitOfWork, emailService, now, cancellationToken);
        await TerminateDueItemsAsync(unitOfWork, emailService, now, cancellationToken);
    }

    private async Task SuspendDueItemsAsync(IUnitOfWork unitOfWork, IEmailService emailService, DateTime now, CancellationToken cancellationToken)
    {
        var repository = unitOfWork.Repository<OrderRequestItem, int>();
        var suspendDeadline = now.AddDays(-_appSettings.DunningSuspendAfterDays);
        var dueItems = await repository.Query()
            .Include(i => i.OrderRequest)
            .Include(i => i.ServicePlan)
            .Include(i => i.TldPricing)
            .Where(i => i.RenewsFromItemId == null && i.ChangesFromItemId == null
                && i.ExpiresAt != null
                && i.SuspendedAt == null
                && i.TerminatedAt == null
                && i.ExpiresAt <= suspendDeadline)
            .ToListAsync(cancellationToken);

        foreach (var item in dueItems)
        {
            try
            {
                await emailService.SendAsync(
                    item.OrderRequest.CustomerEmail,
                    "Dịch vụ tạm khóa do quá hạn thanh toán - Cloudverse",
                    $"Dịch vụ {ProductName(item)} (đơn {item.OrderRequest.OrderCode}) đã bị tạm khóa do quá hạn thanh toán từ {item.ExpiresAt:dd/MM/yyyy}. Vui lòng gia hạn để khôi phục.",
                    cancellationToken);

                item.SuspendedAt = now;
                repository.Update(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tạm khóa dịch vụ cho item #{ItemId} thất bại", item.Id);
            }
        }

        if (dueItems.Count > 0)
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task SendTerminationWarningsAsync(IUnitOfWork unitOfWork, IEmailService emailService, DateTime now, CancellationToken cancellationToken)
    {
        var repository = unitOfWork.Repository<OrderRequestItem, int>();
        var warningDeadline = now.AddDays(-_appSettings.DunningTerminationWarningAfterDays);
        var dueItems = await repository.Query()
            .Include(i => i.OrderRequest)
            .Include(i => i.ServicePlan)
            .Include(i => i.TldPricing)
            .Where(i => i.RenewsFromItemId == null && i.ChangesFromItemId == null
                && i.ExpiresAt != null
                && i.TerminationWarningSentAt == null
                && i.TerminatedAt == null
                && i.ExpiresAt <= warningDeadline)
            .ToListAsync(cancellationToken);

        foreach (var item in dueItems)
        {
            try
            {
                await emailService.SendAsync(
                    item.OrderRequest.CustomerEmail,
                    "Cảnh báo: dịch vụ sắp bị hủy và xoá dữ liệu - Cloudverse",
                    $"Dịch vụ {ProductName(item)} (đơn {item.OrderRequest.OrderCode}) sẽ bị hủy và xoá toàn bộ dữ liệu sau {_appSettings.DunningTerminateAfterDays - _appSettings.DunningTerminationWarningAfterDays} ngày nữa nếu không thanh toán. Vui lòng gia hạn ngay.",
                    cancellationToken);

                item.TerminationWarningSentAt = now;
                repository.Update(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gửi cảnh báo hủy dịch vụ cho item #{ItemId} thất bại", item.Id);
            }
        }

        if (dueItems.Count > 0)
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task TerminateDueItemsAsync(IUnitOfWork unitOfWork, IEmailService emailService, DateTime now, CancellationToken cancellationToken)
    {
        var repository = unitOfWork.Repository<OrderRequestItem, int>();
        var terminateDeadline = now.AddDays(-_appSettings.DunningTerminateAfterDays);
        var dueItems = await repository.Query()
            .Include(i => i.OrderRequest)
            .Include(i => i.ServicePlan)
            .Include(i => i.TldPricing)
            .Where(i => i.RenewsFromItemId == null && i.ChangesFromItemId == null
                && i.ExpiresAt != null
                && i.TerminatedAt == null
                && i.ExpiresAt <= terminateDeadline)
            .ToListAsync(cancellationToken);

        foreach (var item in dueItems)
        {
            try
            {
                await emailService.SendAsync(
                    item.OrderRequest.CustomerEmail,
                    "Dịch vụ đã bị hủy - Cloudverse",
                    $"Dịch vụ {ProductName(item)} (đơn {item.OrderRequest.OrderCode}) đã bị hủy và xoá dữ liệu do quá hạn thanh toán quá lâu. Vui lòng liên hệ hỗ trợ nếu cần khôi phục.",
                    cancellationToken);

                // Xoá thông tin bàn giao mô phỏng (mô phỏng "xoá VM, thu hồi IP") - đối xứng với lúc
                // IFakeProvisioningGenerator sinh ra các field này lúc Completed.
                item.ProvisionedIpAddress = null;
                item.ProvisionedRootPassword = null;
                item.ProvisionedNameservers = null;
                item.TerminatedAt = now;
                repository.Update(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Hủy dịch vụ cho item #{ItemId} thất bại", item.Id);
            }
        }

        if (dueItems.Count > 0)
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }

    private static string ProductName(OrderRequestItem item) =>
        item.ServicePlan?.Name ?? (item.TldPricing is not null ? $"{item.DomainName}{item.TldPricing.Tld}" : "Dịch vụ");
}
