using System.IdentityModel.Tokens.Jwt;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Sales.OrderRequests;
using CloudServiceStore.Application.Features.Admin.Sales.OrderRequests.Dtos;
using CloudServiceStore.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/order-requests")]
[Authorize(Roles = "Admin,Editor")]
public class AdminOrderRequestsController : ControllerBase
{
    private readonly IAdminOrderRequestService _service;
    private readonly IOrderRequestExportService _exportService;

    public AdminOrderRequestsController(IAdminOrderRequestService service, IOrderRequestExportService exportService)
    {
        _service = service;
        _exportService = exportService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminOrderRequestDto>>> GetList([FromQuery] OrderRequestQueryParams query, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(query, cancellationToken));
    }

    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<AdminOrderRequestDto>> UpdateStatus(int id, UpdateOrderRequestStatusDto dto, CancellationToken cancellationToken)
    {
        return Ok(await _service.UpdateStatusAsync(id, dto, GetUserId(), cancellationToken));
    }

    // Xuất Excel chỉ dành cho Admin (mục 3.2.7 đề bài), khác quyền mặc định Admin,Editor của cả controller.
    [HttpGet("export")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Export([FromQuery] OrderRequestStatus? status, CancellationToken cancellationToken)
    {
        var fileBytes = await _exportService.ExportToExcelAsync(status, cancellationToken);
        var fileName = $"order-requests-{DateTime.UtcNow:yyyyMMdd-HHmmss}.xlsx";
        return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return Guid.Parse(sub!);
    }
}
