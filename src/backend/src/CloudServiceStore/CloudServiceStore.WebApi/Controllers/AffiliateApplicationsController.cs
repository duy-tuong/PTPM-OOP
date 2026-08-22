using System.IdentityModel.Tokens.Jwt;
using CloudServiceStore.Application.Features.Sales.AffiliateApplications;
using CloudServiceStore.Application.Features.Sales.AffiliateApplications.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

// Công khai, KHÔNG [Authorize] - xem comment OrderRequestsController.cs (cùng lý do, cùng cách gán
// CustomerId khi khách đã đăng nhập với role "Customer").
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
        Guid? customerId = null;
        if (User.Identity?.IsAuthenticated == true && User.IsInRole("Customer"))
        {
            var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (Guid.TryParse(sub, out var parsed))
            {
                customerId = parsed;
            }
        }

        var result = await _service.CreateAsync(dto, customerId, cancellationToken);
        return CreatedAtAction(nameof(Create), new { id = result.Id }, result);
    }
}
