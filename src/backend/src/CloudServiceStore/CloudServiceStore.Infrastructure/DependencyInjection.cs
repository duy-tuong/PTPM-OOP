using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Admin.Sales.OrderRequests;
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
        services.AddSingleton<IEmailService, LoggingEmailService>();
        services.AddSingleton<IAppSettings, AppSettings>();
        services.AddScoped<IOrderStatusObserver, AuditLogOrderObserver>();
        services.AddScoped<IOrderRequestExportService, OrderRequestExportService>();

        return services;
    }
}
