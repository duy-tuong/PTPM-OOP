using CloudServiceStore.Application.Features.Auth.Dtos;
using CloudServiceStore.Application.Features.Customers.Auth.Dtos;

namespace CloudServiceStore.Application.Features.Customers.Auth;

public interface ICustomerAuthService
{
    Task<CustomerAuthResponse> RegisterAsync(CustomerRegisterRequest request, CancellationToken cancellationToken = default);

    Task<CustomerAuthResponse> LoginAsync(CustomerLoginRequest request, CancellationToken cancellationToken = default);

    Task<CustomerAuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);

    Task LogoutAsync(Guid customerId, CancellationToken cancellationToken = default);

    Task<CustomerProfileDto> GetProfileAsync(Guid customerId, CancellationToken cancellationToken = default);

    Task<CustomerProfileDto> UpdateProfileAsync(Guid customerId, UpdateCustomerProfileDto dto, CancellationToken cancellationToken = default);

    Task ChangePasswordAsync(Guid customerId, ChangePasswordRequest request, CancellationToken cancellationToken = default);

    Task RequestEmailChangeAsync(Guid customerId, RequestEmailChangeDto dto, CancellationToken cancellationToken = default);

    Task ConfirmEmailChangeAsync(string token, CancellationToken cancellationToken = default);

    Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);

    Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);
}
