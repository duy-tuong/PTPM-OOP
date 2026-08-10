using CloudServiceStore.Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Middleware;

// Bắt toàn bộ exception chưa được controller xử lý, quy đổi thành ProblemDetails chuẩn
// (CLAUDE.md §2.2: "Error Handling: Sử dụng ProblemDetails chuẩn của .NET").
public class AppExceptionHandler : IExceptionHandler
{
    private readonly ILogger<AppExceptionHandler> _logger;

    public AppExceptionHandler(ILogger<AppExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (statusCode, title) = exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, "Không tìm thấy dữ liệu"),
            ValidationException => (StatusCodes.Status400BadRequest, "Dữ liệu không hợp lệ"),
            ConflictException => (StatusCodes.Status409Conflict, "Xung đột dữ liệu"),
            _ => (StatusCodes.Status500InternalServerError, "Đã có lỗi xảy ra")
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception");
        }

        httpContext.Response.StatusCode = statusCode;

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = exception.Message
        };

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
