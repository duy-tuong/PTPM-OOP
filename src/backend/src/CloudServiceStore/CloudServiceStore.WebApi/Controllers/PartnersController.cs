using CloudServiceStore.Application.Features.Content.Partners;
using CloudServiceStore.Application.Features.Content.Partners.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/partners")]
public class PartnersController : ControllerBase
{
    private readonly IPartnerService _service;

    public PartnersController(IPartnerService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<PartnerDto>>> GetList(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetListAsync(cancellationToken));
    }
}
