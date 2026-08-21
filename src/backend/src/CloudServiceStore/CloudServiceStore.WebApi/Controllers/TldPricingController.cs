using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Catalog.TldPricings;
using CloudServiceStore.Application.Features.Catalog.TldPricings.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/tld-pricing")]
public class TldPricingController : ControllerBase
{
    private readonly ITldPricingService _service;

    public TldPricingController(ITldPricingService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<TldPricingDto>>> GetList([FromQuery] TldPricingQueryParams query, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(query, cancellationToken));
    }
}
