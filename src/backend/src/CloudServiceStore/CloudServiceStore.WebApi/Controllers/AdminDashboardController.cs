using CloudServiceStore.Application.Features.Admin.Reporting.DashboardStats;
using CloudServiceStore.Application.Features.Admin.Reporting.DashboardStats.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/dashboard-stats")]
[Authorize(Roles = "Admin")]
public class AdminDashboardController : ControllerBase
{
    private readonly IDashboardStatsService _service;

    public AdminDashboardController(IDashboardStatsService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardStatsDto>> GetStats(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetStatsAsync(cancellationToken));
    }
}
