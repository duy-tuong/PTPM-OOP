using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Admin.Sales.OrderRequests;
using CloudServiceStore.Infrastructure.BackgroundServices;
using CloudServiceStore.Infrastructure.Caching;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Infrastructure.Observers;
using CloudServiceStore.Infrastructure.Persistence.Repositories;
using CloudServiceStore.Infrastructure.Security;
using CloudServiceStore.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Resend;

namespace CloudServiceStore.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options
                .UseSqlServer(
                    configuration.GetConnectionString("DefaultConnection"),
                    sqlServerOptions => sqlServerOptions.EnableRetryOnFailure(
                        // Đã verify thật qua docker-compose: SQL Server lần đầu chạy trên volume rỗng có
                        // thể mất >1 phút mới nhận kết nối (nâng cấp msdb/tempdb) - nới ngân sách retry
                        // làm lớp phòng thủ thứ 2 cho các cách deploy không có healthcheck gate thứ tự
                        // khởi động như docker-compose.yml (vd chạy trực tiếp trên VM, DB khởi động chậm).
                        maxRetryCount: 10,
                        maxRetryDelay: TimeSpan.FromSeconds(15),
                        errorNumbersToAdd: null))
                .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning)));

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddSingleton<ISiteSettingsCache, SiteSettingsCache>();
        services.AddSingleton<IQrCodeFactory, QrCodeFactory>();
        services.AddSingleton<IFileStorageService, LocalFileStorageService>();

        // Resend chỉ được dùng khi có ResendApiKey thật (máy dev/CI không cấu hình thì giữ nguyên hành
        // vi giả lập cũ, không throw lúc khởi động). IEmailService đăng ký Scoped (không phải Singleton
        // như trước) vì ResendEmailService giữ IResend - 1 typed HttpClient - việc "giam" 1 typed client
        // vào Singleton là anti-pattern đã biết (rò rỉ kết nối/DNS không xoay vòng qua vòng đời app dài
        // hạn); mọi call site hiện tại (Application services, RenewalReminderBackgroundService qua
        // IServiceScopeFactory per tick) đều đã Scoped-safe, xem RenewalReminderBackgroundService.cs.
        var resendApiKey = configuration["App:ResendApiKey"];
        if (!string.IsNullOrWhiteSpace(resendApiKey))
        {
            services.AddResend(resendApiKey);
            services.AddScoped<IEmailService, ResendEmailService>();
        }
        else
        {
            services.AddScoped<IEmailService, LoggingEmailService>();
        }

        services.AddSingleton<IAppSettings, AppSettings>();
        services.AddSingleton<IPaymentGatewayService, PayOsPaymentGatewayService>();
        services.AddScoped<IOrderStatusObserver, AuditLogOrderObserver>();
        services.AddScoped<IOrderStatusObserver, EmailOrderObserver>();
        services.AddScoped<IOrderRequestExportService, OrderRequestExportService>();

        services.AddSingleton<IFakeProvisioningGenerator, FakeProvisioningGenerator>();
        services.AddHostedService<OrderAutoProvisioningBackgroundService>();
        services.AddHostedService<RenewalReminderBackgroundService>();
        services.AddHostedService<DunningBackgroundService>();

        return services;
    }
}
