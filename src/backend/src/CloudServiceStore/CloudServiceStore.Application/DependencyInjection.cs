using CloudServiceStore.Application.Common.Services;
using CloudServiceStore.Application.Features.Auth;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<OrderStatusNotifier>();

        return services;
    }
}
