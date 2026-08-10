using System.Collections.Concurrent;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Infrastructure.Caching;

// Singleton pattern: giữ 1 bản cache duy nhất của bảng SiteSetting cho toàn bộ vòng đời ứng dụng,
// tránh query lại DB mỗi request cho dữ liệu cấu hình ít thay đổi (site name, hotline, SLA...).
// Vì Singleton không được inject trực tiếp AppDbContext (Scoped) — sẽ gây lỗi "captive dependency" —
// nên phải nhận IServiceScopeFactory và tự tạo scope ngắn hạn mỗi lần cần đọc DB.
public class SiteSettingsCache : ISiteSettingsCache
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ConcurrentDictionary<string, string> _cache = new();

    public SiteSettingsCache(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public string? Get(string key)
    {
        return _cache.TryGetValue(key, out var value) ? value : null;
    }

    public async Task RefreshAsync(CancellationToken cancellationToken = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var settings = await dbContext.SiteSettings
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        _cache.Clear();
        foreach (var setting in settings)
        {
            _cache[setting.SettingKey] = setting.SettingValue;
        }
    }
}
