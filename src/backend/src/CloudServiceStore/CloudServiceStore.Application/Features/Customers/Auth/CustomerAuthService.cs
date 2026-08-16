using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Auth.Dtos;
using CloudServiceStore.Application.Features.Customers.Auth.Dtos;
using CloudServiceStore.Domain.Entities.Identity;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Customers.Auth;

public class CustomerAuthService : ICustomerAuthService
{
    // Id "Customer" seed cứng ở AppRoleConfiguration.HasData (Id=3) - cùng tiền lệ hardcode RoleId=1
    // ("Admin") đã dùng ở AppUserRoleConfiguration cho user Admin seed sẵn.
    private const int CustomerRoleId = 3;
    private const string CustomerRoleName = "Customer";

    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public CustomerAuthService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, IJwtTokenService jwtTokenService)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<CustomerAuthResponse> RegisterAsync(CustomerRegisterRequest request, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Customer, Guid>();

        var emailExists = await repository.Query()
            .AnyAsync(c => c.Email == request.Email, cancellationToken);

        if (emailExists)
        {
            throw new ConflictException("Email đã được sử dụng.");
        }

        var customer = new Customer
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            RoleId = CustomerRoleId,
            CustomerType = CustomerType.Individual
        };

        await repository.AddAsync(customer, cancellationToken);

        var response = IssueTokens(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return response;
    }

    public async Task<CustomerAuthResponse> LoginAsync(CustomerLoginRequest request, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Customer, Guid>();

        var customer = await repository.Query()
            .FirstOrDefaultAsync(c => c.IsActive && c.Email == request.Email, cancellationToken);

        if (customer is null || !_passwordHasher.Verify(request.Password, customer.PasswordHash))
        {
            throw new UnauthorizedAccessException("Sai email hoặc mật khẩu.");
        }

        var response = IssueTokens(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return response;
    }

    public async Task<CustomerAuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Customer, Guid>();

        var customer = await repository.Query()
            .FirstOrDefaultAsync(
                c => c.RefreshToken == request.RefreshToken
                     && c.RefreshTokenExpiryTime.HasValue
                     && c.RefreshTokenExpiryTime.Value > DateTime.UtcNow,
                cancellationToken);

        if (customer is null)
        {
            throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");
        }

        var response = IssueTokens(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return response;
    }

    public async Task LogoutAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Customer, Guid>();

        var customer = await repository.GetByIdAsync(customerId, cancellationToken);
        if (customer is null)
        {
            return;
        }

        customer.RefreshToken = null;
        customer.RefreshTokenExpiryTime = null;

        repository.Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    // Chỉ mutate field trên entity đang được EF Core track (Added ở RegisterAsync, Unchanged ở
    // LoginAsync/RefreshTokenAsync) - KHÔNG gọi repository.Update() ở đây: DbSet.Update() ép state
    // entry sang Modified, nếu gọi trên entity vừa AddAsync (đang Added) sẽ ghi đè thành Modified và
    // EF sinh câu UPDATE thay vì INSERT cho 1 dòng chưa tồn tại - customer mới sẽ không được lưu.
    // Change tracker tự phát hiện các field vừa gán khi SaveChangesAsync chạy, không cần Update() thủ công.
    private CustomerAuthResponse IssueTokens(Customer customer)
    {
        var accessToken = _jwtTokenService.GenerateAccessToken(customer.Id, customer.Email, customer.Email, [CustomerRoleName]);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        customer.RefreshToken = refreshToken;
        customer.RefreshTokenExpiryTime = DateTime.UtcNow.Add(_jwtTokenService.RefreshTokenLifetime);
        customer.UpdatedAt = DateTime.UtcNow;

        return new CustomerAuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAtUtc = DateTime.UtcNow.Add(_jwtTokenService.AccessTokenLifetime),
            FullName = customer.FullName
        };
    }
}
