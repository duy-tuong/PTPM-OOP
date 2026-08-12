using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Reporting.AuditLogs;
using CloudServiceStore.Application.Features.Admin.Reporting.AuditLogs.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/audit-logs")]
[Authorize(Roles = "Admin")]
public class AdminAuditLogsController : ControllerBase
{
    private readonly IAdminAuditLogService _service;

    public AdminAuditLogsController(IAdminAuditLogService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminAuditLogDto>>> GetList([FromQuery] AuditLogQueryParams query, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(query, cancellationToken));
    }
}
