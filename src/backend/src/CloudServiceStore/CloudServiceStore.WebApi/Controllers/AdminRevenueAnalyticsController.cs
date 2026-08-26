using CloudServiceStore.Application.Features.Admin.Reporting.RevenueAnalytics;
using CloudServiceStore.Application.Features.Admin.Reporting.RevenueAnalytics.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/revenue-analytics")]
[Authorize(Roles = "Admin")]
public class AdminRevenueAnalyticsController : ControllerBase
{
    private readonly IRevenueAnalyticsService _service;

    public AdminRevenueAnalyticsController(IRevenueAnalyticsService service)
    {
        _service = service;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<RevenueAnalyticsSummaryDto>> GetSummary(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetSummaryAsync(cancellationToken));
    }

    [HttpGet("trend")]
    public async Task<ActionResult<List<MrrTrendPointDto>>> GetTrend([FromQuery] int months, CancellationToken cancellationToken)
    {
        var normalizedMonths = months is < 1 or > 24 ? 12 : months;
        return Ok(await _service.GetTrendAsync(normalizedMonths, cancellationToken));
    }

    [HttpGet("by-product-line")]
    public async Task<ActionResult<List<RevenueByProductLineDto>>> GetByProductLine(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetRevenueByProductLineAsync(cancellationToken));
    }

    [HttpGet("by-region")]
    public async Task<ActionResult<List<RevenueByRegionDto>>> GetByRegion(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetRevenueByRegionAsync(cancellationToken));
    }

    [HttpGet("ar-aging")]
    public async Task<ActionResult<List<ArAgingBucketDto>>> GetArAging(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetArAgingAsync(cancellationToken));
    }
}
