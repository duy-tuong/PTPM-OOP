using CloudServiceStore.Application.Features.Sales.AffiliateApplications;
using CloudServiceStore.Application.Features.Sales.AffiliateApplications.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/affiliate-applications")]
public class AffiliateApplicationsController : ControllerBase
{
    private readonly IAffiliateApplicationService _service;

    public AffiliateApplicationsController(IAffiliateApplicationService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<AffiliateApplicationDto>> Create(CreateAffiliateApplicationDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(Create), new { id = result.Id }, result);
    }
}
