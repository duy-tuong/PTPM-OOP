namespace CloudServiceStore.Application.Common.Interfaces;

// Interface framework-agnostic (không dùng IFormFile - kiểu của ASP.NET Core, Application layer không
// nên phụ thuộc web framework) - controller tự đọc IFormFile rồi truyền Stream/extension xuống đây.
public interface IFileStorageService
{
    // Lưu file, trả về đường dẫn tương đối (vd "/uploads/xxxx.jpg") để controller tự ghép domain
    // tuyệt đối (frontend và backend khác origin, không thể trả URL tương đối cho <img src>).
    Task<string> SaveAsync(Stream content, string fileExtension, CancellationToken cancellationToken = default);
}
