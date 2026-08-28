using CloudServiceStore.Application.Features.Admin.Search;
using CloudServiceStore.Application.Features.Admin.Search.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/search")]
[Authorize(Roles = "Admin,Editor")]
public class AdminSearchController : ControllerBase
{
    private readonly IAdminSearchService _service;

    public AdminSearchController(IAdminSearchService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<AdminSearchResultDto>> Search([FromQuery] string q, CancellationToken cancellationToken)
    {
        // Đọc role thẳng từ claim JWT (User.IsInRole) - không nhận cờ isAdmin từ client, tránh Editor tự
        // gửi isAdmin=true để dò dữ liệu Admin-only qua ô tìm kiếm.
        var isAdmin = User.IsInRole("Admin");
        return Ok(await _service.SearchAsync(q ?? string.Empty, isAdmin, cancellationToken));
    }
}
