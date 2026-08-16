using System.IdentityModel.Tokens.Jwt;
using CloudServiceStore.Application.Features.Auth.Dtos;
using CloudServiceStore.Application.Features.Customers.Auth;
using CloudServiceStore.Application.Features.Customers.Auth.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/customer-auth")]
public class CustomerAuthController : ControllerBase
{
    private readonly ICustomerAuthService _customerAuthService;

    public CustomerAuthController(ICustomerAuthService customerAuthService)
    {
        _customerAuthService = customerAuthService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<CustomerAuthResponse>> Register(CustomerRegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await _customerAuthService.RegisterAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<CustomerAuthResponse>> Login(CustomerLoginRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _customerAuthService.LoginAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("refresh-token")]
    [AllowAnonymous]
    public async Task<ActionResult<CustomerAuthResponse>> RefreshToken(RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _customerAuthService.RefreshTokenAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        await _customerAuthService.LogoutAsync(GetCustomerId(), cancellationToken);
        return NoContent();
    }

    private Guid GetCustomerId()
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return Guid.Parse(sub!);
    }
}
