using CloudServiceStore.Application.Features.Marketing.Promotions;
using CloudServiceStore.Application.Features.Marketing.Promotions.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/promotions")]
public class PromotionsController : ControllerBase
{
    private readonly IPromotionService _service;

    public PromotionsController(IPromotionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<PromotionDto>>> GetList(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetActiveListAsync(cancellationToken));
    }
}
