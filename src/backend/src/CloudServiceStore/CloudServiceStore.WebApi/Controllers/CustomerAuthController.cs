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
        try
        {
            var result = await _customerAuthService.RegisterAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (CloudServiceStore.Application.Common.Exceptions.ConflictException ex)
        {
            return Conflict(new { message = ex.Message });
        }
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
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        await _customerAuthService.LogoutAsync(GetCustomerId(), cancellationToken);
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<CustomerProfileDto>> GetProfile(CancellationToken cancellationToken)
    {
        try
        {
            var result = await _customerAuthService.GetProfileAsync(GetCustomerId(), cancellationToken);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPut("me")]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<CustomerProfileDto>> UpdateProfile(UpdateCustomerProfileDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _customerAuthService.UpdateProfileAsync(GetCustomerId(), dto, cancellationToken);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("change-password")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await _customerAuthService.ChangePasswordAsync(GetCustomerId(), request, cancellationToken);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("change-email/request")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> RequestEmailChange(RequestEmailChangeDto dto, CancellationToken cancellationToken)
    {
        try
        {
            await _customerAuthService.RequestEmailChangeAsync(GetCustomerId(), dto, cancellationToken);
            return NoContent();
        }
        catch (CloudServiceStore.Application.Common.Exceptions.ConflictException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpGet("change-email/confirm")]
    [AllowAnonymous]
    public async Task<IActionResult> ConfirmEmailChange([FromQuery] string token, CancellationToken cancellationToken)
    {
        try
        {
            await _customerAuthService.ConfirmEmailChangeAsync(token, cancellationToken);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        await _customerAuthService.ForgotPasswordAsync(request, cancellationToken);
        // Luôn trả 204 kể cả email không tồn tại - tránh lộ thông tin email nào đã đăng ký.
        return NoContent();
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        try
        {
            await _customerAuthService.ResetPasswordAsync(request, cancellationToken);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    private Guid GetCustomerId()
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return Guid.Parse(sub!);
    }
}
