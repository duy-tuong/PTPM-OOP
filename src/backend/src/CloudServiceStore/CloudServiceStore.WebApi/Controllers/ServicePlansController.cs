using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Catalog.ServicePlans;
using CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/service-plans")]
public class ServicePlansController : ControllerBase
{
    private readonly IServicePlanService _service;

    public ServicePlansController(IServicePlanService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ServicePlanListItemDto>>> GetList([FromQuery] ServicePlanQueryParams query, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(query, cancellationToken));
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<ServicePlanDetailDto>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetBySlugAsync(slug, cancellationToken));
    }
}
