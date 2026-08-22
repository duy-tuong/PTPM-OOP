using CloudServiceStore.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace CloudServiceStore.Infrastructure.Services;

// Application layer không tham chiếu Microsoft.Extensions.Configuration trực tiếp (đúng Clean
// Architecture) - đọc IConfiguration ở đây (Infrastructure), expose ra Application qua IAppSettings,
// mirror đúng cách LocalFileStorageService đọc Storage:UploadsPath.
public class AppSettings : IAppSettings
{
    public string PublicBaseUrl { get; }

    public AppSettings(IConfiguration configuration)
    {
        PublicBaseUrl = configuration["App:PublicBaseUrl"]?.TrimEnd('/') ?? string.Empty;
    }
}
