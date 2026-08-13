using CloudServiceStore.Domain.Entities.System;
using CloudServiceStore.Infrastructure.Caching;
using CloudServiceStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Tests.Infrastructure.Caching;

// SiteSettingsCache là Singleton nhưng cần đọc AppDbContext (Scoped) qua IServiceScopeFactory —
// nên test dựng 1 ServiceProvider thật (không mock) để có IServiceScopeFactory hoạt động đúng,
// thay vì cố mock chuỗi IServiceScopeFactory -> IServiceScope -> IServiceProvider.
public class SiteSettingsCacheTests
{
    private static ServiceProvider BuildProvider(string databaseName)
    {
        var services = new ServiceCollection();
        services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase(databaseName));
        return services.BuildServiceProvider();
    }

    [Fact]
    public void Get_BeforeRefresh_ReturnsNull()
    {
        using var provider = BuildProvider(Guid.NewGuid().ToString());
        var sut = new SiteSettingsCache(provider.GetRequiredService<IServiceScopeFactory>());

        Assert.Null(sut.Get("site_name"));
    }

    [Fact]
    public async Task RefreshAsync_PopulatesCacheFromDatabase()
    {
        using var provider = BuildProvider(Guid.NewGuid().ToString());
        using (var scope = provider.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            context.SiteSettings.Add(new SiteSetting { SettingKey = "site_name", SettingValue = "CloudServiceStore", SettingGroup = "general" });
            await context.SaveChangesAsync();
        }

        var sut = new SiteSettingsCache(provider.GetRequiredService<IServiceScopeFactory>());
        await sut.RefreshAsync();

        Assert.Equal("CloudServiceStore", sut.Get("site_name"));
    }
}
