using CloudServiceStore.Application.Features.Sales.ConsultationRequests;
using CloudServiceStore.Application.Features.Sales.ConsultationRequests.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/consultation-requests")]
public class ConsultationRequestsController : ControllerBase
{
    private readonly IConsultationRequestService _service;

    public ConsultationRequestsController(IConsultationRequestService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<ConsultationRequestDto>> Create(CreateConsultationRequestDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(Create), new { id = result.Id }, result);
    }
}
