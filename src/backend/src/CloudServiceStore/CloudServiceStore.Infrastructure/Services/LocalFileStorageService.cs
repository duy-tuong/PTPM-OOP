using CloudServiceStore.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace CloudServiceStore.Infrastructure.Services;

// Lưu đĩa cục bộ dưới wwwroot/uploads (phục vụ qua app.UseStaticFiles() ở Program.cs). Infrastructure
// là class library thuần (không có FrameworkReference ASP.NET Core) nên không dùng IWebHostEnvironment
// được - đọc đường dẫn qua IConfiguration ("Storage:UploadsPath"), mặc định khớp đúng nơi UseStaticFiles
// tự tìm wwwroot (ContentRootPath = AppContext.BaseDirectory khi không cấu hình khác). Triển khai
// Docker (docker-compose.yml) gắn volume bền vững đúng thư mục này để không mất ảnh khi container
// tái tạo.
public class LocalFileStorageService : IFileStorageService
{
    private readonly string _uploadsRoot;

    public LocalFileStorageService(IConfiguration configuration)
    {
        var configuredPath = configuration["Storage:UploadsPath"];
        _uploadsRoot = string.IsNullOrWhiteSpace(configuredPath)
            ? Path.Combine(AppContext.BaseDirectory, "wwwroot", "uploads")
            : configuredPath;
    }

    public async Task<string> SaveAsync(Stream content, string fileExtension, CancellationToken cancellationToken = default)
    {
        Directory.CreateDirectory(_uploadsRoot);

        var fileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(_uploadsRoot, fileName);

        await using var fileStream = File.Create(filePath);
        await content.CopyToAsync(fileStream, cancellationToken);

        return $"/uploads/{fileName}";
    }
}
