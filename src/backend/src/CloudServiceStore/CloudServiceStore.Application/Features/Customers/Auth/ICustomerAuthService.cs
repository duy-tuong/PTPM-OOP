using CloudServiceStore.Application.Features.Auth.Dtos;
using CloudServiceStore.Application.Features.Customers.Auth.Dtos;

namespace CloudServiceStore.Application.Features.Customers.Auth;

public interface ICustomerAuthService
{
    Task<CustomerAuthResponse> RegisterAsync(CustomerRegisterRequest request, CancellationToken cancellationToken = default);

    Task<CustomerAuthResponse> LoginAsync(CustomerLoginRequest request, CancellationToken cancellationToken = default);

    Task<CustomerAuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);

    Task LogoutAsync(Guid customerId, CancellationToken cancellationToken = default);
}
