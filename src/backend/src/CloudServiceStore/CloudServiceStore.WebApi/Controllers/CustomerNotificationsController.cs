using System.IdentityModel.Tokens.Jwt;
using CloudServiceStore.Application.Features.Customers.Notifications;
using CloudServiceStore.Application.Features.Customers.Notifications.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/customer/notifications")]
[Authorize(Roles = "Customer")]
public class CustomerNotificationsController : ControllerBase
{
    private readonly ICustomerNotificationService _service;

    public CustomerNotificationsController(ICustomerNotificationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<CustomerNotificationDto>>> GetMine(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetMineAsync(GetCustomerId(), cancellationToken: cancellationToken));
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetUnreadCountAsync(GetCustomerId(), cancellationToken));
    }

    [HttpPost("{id:long}/read")]
    public async Task<IActionResult> MarkAsRead(long id, CancellationToken cancellationToken)
    {
        await _service.MarkAsReadAsync(GetCustomerId(), id, cancellationToken);
        return NoContent();
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken)
    {
        await _service.MarkAllAsReadAsync(GetCustomerId(), cancellationToken);
        return NoContent();
    }

    private Guid GetCustomerId()
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return Guid.Parse(sub!);
    }
}
