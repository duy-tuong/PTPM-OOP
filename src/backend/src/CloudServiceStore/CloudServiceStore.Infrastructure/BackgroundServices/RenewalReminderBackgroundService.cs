using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.BackgroundServices;

// Tier 4 "vòng đời gia hạn" - gửi email nhắc khách trước khi dịch vụ hết hạn
// (IAppSettings.RenewalReminderLeadDays ngày). Service RIÊNG, không gộp vào
// OrderAutoProvisioningBackgroundService (Tier 3) - giữ mỗi service 1 trách nhiệm, không đụng service
// Tier 3 đã ship/test ổn định. Mỗi tick tạo 1 scope mới (mirror đúng pattern
// OrderAutoProvisioningBackgroundService/Program.cs) vì IUnitOfWork đăng ký Scoped.
public class RenewalReminderBackgroundService : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromMinutes(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IAppSettings _appSettings;
    private readonly ILogger<RenewalReminderBackgroundService> _logger;

    public RenewalReminderBackgroundService(
        IServiceScopeFactory scopeFactory,
        IAppSettings appSettings,
        ILogger<RenewalReminderBackgroundService> logger)
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
                await SendDueRemindersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi quét dịch vụ sắp hết hạn để gửi email nhắc (Tier 4)");
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

    private async Task SendDueRemindersAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
        var repository = unitOfWork.Repository<OrderRequestItem, int>();
        var now = DateTime.UtcNow;
        var reminderDeadline = now.AddDays(_appSettings.RenewalReminderLeadDays);

        // IsWithinReminderWindow() bên dưới là bản pure-function tương đương để unit-test -
        // LINQ-to-Entities không dịch được lời gọi hàm C# tuỳ ý trong .Where(), nên điều kiện ở đây
        // phải viết lại dạng biểu thức. Lọc RenewsFromItemId == null - chỉ item "đang sống" mới có
        // vòng đời riêng để nhắc, item gia hạn (biên lai) không có ExpiresAt nên đã tự loại theo điều
        // kiện ExpiresAt != null, nhưng lọc tường minh cho rõ ý.
        var dueItems = await repository.Query()
            .Include(i => i.OrderRequest)
            .Include(i => i.ServicePlan)
            .Include(i => i.TldPricing)
            .Where(i => i.RenewsFromItemId == null
                && i.ExpiresAt != null
                && i.RenewalReminderSentAt == null
                && i.ExpiresAt > now
                && i.ExpiresAt <= reminderDeadline)
            .ToListAsync(cancellationToken);

        foreach (var item in dueItems)
        {
            try
            {
                var productName = item.ServicePlan?.Name
                    ?? (item.TldPricing is not null ? $"{item.DomainName}{item.TldPricing.Tld}" : "Dịch vụ");

                await emailService.SendAsync(
                    item.OrderRequest.CustomerEmail,
                    "Dịch vụ sắp hết hạn - Cloudverse",
                    $"Dịch vụ {productName} (đơn {item.OrderRequest.OrderCode}) sẽ hết hạn vào {item.ExpiresAt:dd/MM/yyyy}. Vui lòng gia hạn để không bị gián đoạn.",
                    cancellationToken);

                // Cờ chống gửi trùng - set ngay sau khi gửi thành công, không phụ thuộc tick sau.
                item.RenewalReminderSentAt = now;
                repository.Update(item);
            }
            catch (Exception ex)
            {
                // 1 item lỗi không được chặn các item còn lại trong cùng tick.
                _logger.LogError(ex, "Gửi email nhắc gia hạn cho item #{ItemId} thất bại", item.Id);
            }
        }

        if (dueItems.Count > 0)
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }

    // Tách riêng để unit-test được - BackgroundService.ExecuteAsync (vòng lặp vô hạn + Task.Delay
    // thật) không test trực tiếp một cách thực tế.
    public static bool IsWithinReminderWindow(
        DateTime? expiresAt, DateTime? renewalReminderSentAt, int? renewsFromItemId, int leadDays, DateTime now)
    {
        if (renewsFromItemId is not null) return false;
        if (expiresAt is null) return false;
        if (renewalReminderSentAt is not null) return false;
        return expiresAt > now && expiresAt <= now.AddDays(leadDays);
    }
}
