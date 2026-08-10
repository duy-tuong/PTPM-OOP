using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Infrastructure.Caching;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Infrastructure.Observers;
using CloudServiceStore.Infrastructure.Persistence.Repositories;
using CloudServiceStore.Infrastructure.Security;
using CloudServiceStore.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddSingleton<ISiteSettingsCache, SiteSettingsCache>();
        services.AddSingleton<IQrCodeFactory, QrCodeFactory>();
        services.AddScoped<IOrderStatusObserver, AuditLogOrderObserver>();

        return services;
    }
}
