using CloudServiceStore.Application.Common.Services;
using CloudServiceStore.Application.Features.Auth;
using CloudServiceStore.Application.Features.Catalog.ServicePlans;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<OrderStatusNotifier>();
        services.AddScoped<IServicePlanService, ServicePlanService>();

        return services;
    }
}
