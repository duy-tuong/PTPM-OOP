namespace CloudServiceStore.Application.Common.Interfaces;

public interface ISiteSettingsCache
{
    string? Get(string key);

    Task RefreshAsync(CancellationToken cancellationToken = default);
}
