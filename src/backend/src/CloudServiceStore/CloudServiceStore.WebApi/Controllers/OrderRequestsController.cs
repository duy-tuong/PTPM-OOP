using CloudServiceStore.Application.Features.Sales.OrderRequests;
using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/order-requests")]
public class OrderRequestsController : ControllerBase
{
    private readonly IOrderRequestService _service;

    public OrderRequestsController(IOrderRequestService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<OrderRequestDto>> Create(CreateOrderRequestDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(Create), new { id = result.Id }, result);
    }
}
