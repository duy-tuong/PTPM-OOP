using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

// Upload ảnh cho các form Admin (URL icon/logo/avatar/thumbnail trước đây chỉ dán tay) - lưu qua
// IFileStorageService (LocalFileStorageService, wwwroot/uploads). Ném ValidationException thay vì tự
// trả BadRequest(...) - để AppExceptionHandler xử lý thống nhất thành ProblemDetails, đúng convention
// mọi controller Admin khác đang dùng (ApiError phía frontend đọc problem.Detail, không đọc field
// "message" tự chế). Cả 2 role Admin/Editor đều được upload, khớp quyền soạn nội dung hiện có.
[ApiController]
[Route("api/admin/uploads")]
[Authorize(Roles = "Admin,Editor")]
public class AdminUploadsController : ControllerBase
{
    private const long MaxFileSizeBytes = 5 * 1024 * 1024;

    private static readonly Dictionary<string, string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        ["image/jpeg"] = ".jpg",
        ["image/png"] = ".png",
        ["image/webp"] = ".webp",
        ["image/gif"] = ".gif",
    };

    private readonly IFileStorageService _fileStorageService;

    public AdminUploadsController(IFileStorageService fileStorageService)
    {
        _fileStorageService = fileStorageService;
    }

    [HttpPost("images")]
    [RequestSizeLimit(MaxFileSizeBytes)]
    public async Task<ActionResult<object>> UploadImage(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            throw new ValidationException("Vui lòng chọn file ảnh.");
        }

        if (file.Length > MaxFileSizeBytes)
        {
            throw new ValidationException("Kích thước ảnh tối đa 5MB.");
        }

        if (!AllowedContentTypes.TryGetValue(file.ContentType, out var extension))
        {
            throw new ValidationException("Chỉ chấp nhận ảnh định dạng JPEG, PNG, WEBP hoặc GIF.");
        }

        await using var stream = file.OpenReadStream();
        var relativePath = await _fileStorageService.SaveAsync(stream, extension, cancellationToken);
        var absoluteUrl = $"{Request.Scheme}://{Request.Host}{relativePath}";

        return Ok(new { url = absoluteUrl });
    }
}
