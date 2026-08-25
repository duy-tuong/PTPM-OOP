using System.IdentityModel.Tokens.Jwt;
using CloudServiceStore.Application.Features.Customers.SshKeys;
using CloudServiceStore.Application.Features.Customers.SshKeys.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/customer/ssh-keys")]
[Authorize(Roles = "Customer")]
public class CustomerSshKeysController : ControllerBase
{
    private readonly ICustomerSshKeyService _service;

    public CustomerSshKeysController(ICustomerSshKeyService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<CustomerSshKeyDto>>> GetMine(CancellationToken cancellationToken)
    {
        return Ok(await _service.GetMineAsync(GetCustomerId(), cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<CustomerSshKeyDto>> Create(CreateSshKeyDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(GetCustomerId(), dto, cancellationToken);
        return CreatedAtAction(nameof(GetMine), result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _service.DeleteAsync(GetCustomerId(), id, cancellationToken);
        return NoContent();
    }

    private Guid GetCustomerId()
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return Guid.Parse(sub!);
    }
}
