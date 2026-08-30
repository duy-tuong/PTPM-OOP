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
    private readonly IEmailService _emailService;
    private readonly IAppSettings _appSettings;

    public CustomerAuthService(
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IEmailService emailService,
        IAppSettings appSettings)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _emailService = emailService;
        _appSettings = appSettings;
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

    public async Task<CustomerProfileDto> GetProfileAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Customer, Guid>();
        var customer = await repository.GetByIdAsync(customerId, cancellationToken)
            ?? throw new UnauthorizedAccessException("Người dùng không tồn tại.");

        return ToProfileDto(customer);
    }

    public async Task<CustomerProfileDto> UpdateProfileAsync(Guid customerId, UpdateCustomerProfileDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Customer, Guid>();
        var customer = await repository.GetByIdAsync(customerId, cancellationToken)
            ?? throw new UnauthorizedAccessException("Người dùng không tồn tại.");

        customer.FullName = dto.FullName;
        customer.Phone = dto.Phone;
        customer.CustomerType = dto.CustomerType;
        customer.CompanyName = dto.CompanyName;
        customer.TaxCode = dto.TaxCode;
        customer.UpdatedAt = DateTime.UtcNow;

        repository.Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ToProfileDto(customer);
    }

    public async Task ChangePasswordAsync(Guid customerId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Customer, Guid>();
        var customer = await repository.GetByIdAsync(customerId, cancellationToken)
            ?? throw new UnauthorizedAccessException("Người dùng không tồn tại.");

        if (!_passwordHasher.Verify(request.CurrentPassword, customer.PasswordHash))
        {
            throw new UnauthorizedAccessException("Mật khẩu hiện tại không đúng.");
        }

        customer.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        // Buộc đăng nhập lại ở mọi thiết bị sau khi đổi mật khẩu - mirror AuthService.ChangePasswordAsync.
        customer.RefreshToken = null;
        customer.RefreshTokenExpiryTime = null;
        customer.UpdatedAt = DateTime.UtcNow;

        repository.Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task RequestEmailChangeAsync(Guid customerId, RequestEmailChangeDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Customer, Guid>();
        var customer = await repository.GetByIdAsync(customerId, cancellationToken)
            ?? throw new UnauthorizedAccessException("Người dùng không tồn tại.");

        var emailExists = await repository.Query()
            .AnyAsync(c => c.Id != customerId && c.Email == dto.NewEmail, cancellationToken);
        if (emailExists)
        {
            throw new ConflictException("Email đã được sử dụng.");
        }

        var token = _jwtTokenService.GenerateRefreshToken();
        customer.PendingEmail = dto.NewEmail;
        customer.EmailVerificationToken = token;
        customer.EmailVerificationExpiry = DateTime.UtcNow.AddHours(24);
        customer.UpdatedAt = DateTime.UtcNow;

        repository.Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Route KHÔNG đặt trong app/khach-hang/** - route đó bị proxy.ts (middleware) chặn yêu cầu đăng
        // nhập, nhưng link xác thực có hạn 24h trong khi access token JWT chỉ sống 30 phút
        // (Jwt:AccessTokenExpiryMinutes) - khách hoàn toàn có thể click link sau khi token hết hạn,
        // hoặc từ 1 thiết bị/trình duyệt khác (vd bấm link ngay trong email trên điện thoại).
        var confirmUrl = $"{_appSettings.PublicBaseUrl}/xac-thuc-email?token={token}";
        await _emailService.SendAsync(
            dto.NewEmail,
            "Xác thực email mới - Cloudverse",
            $"Nhấn vào link sau để xác thực email mới của bạn: {confirmUrl}",
            cancellationToken);
    }

    public async Task ConfirmEmailChangeAsync(string token, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Customer, Guid>();
        var now = DateTime.UtcNow;
        var customer = await repository.Query()
            .FirstOrDefaultAsync(
                c => c.EmailVerificationToken == token && c.EmailVerificationExpiry.HasValue && c.EmailVerificationExpiry.Value > now,
                cancellationToken)
            ?? throw new UnauthorizedAccessException("Link xác thực không hợp lệ hoặc đã hết hạn.");

        customer.Email = customer.PendingEmail ?? customer.Email;
        customer.PendingEmail = null;
        customer.IsEmailVerified = true;
        customer.EmailVerificationToken = null;
        customer.EmailVerificationExpiry = null;
        customer.UpdatedAt = now;

        repository.Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Customer, Guid>();
        var customer = await repository.Query()
            .FirstOrDefaultAsync(c => c.IsActive && c.Email == request.Email, cancellationToken);

        // Không tồn tại thì im lặng bỏ qua (không throw) - tránh lộ thông tin email nào đã đăng ký,
        // đúng thông lệ bảo mật chuẩn cho luồng "quên mật khẩu".
        if (customer is null)
        {
            return;
        }

        var token = _jwtTokenService.GenerateRefreshToken();
        customer.PasswordResetToken = token;
        // Ngắn hơn EmailVerificationExpiry (24h) vì đặt lại mật khẩu nhạy cảm hơn xác thực email.
        customer.PasswordResetExpiry = DateTime.UtcNow.AddHours(1);
        customer.UpdatedAt = DateTime.UtcNow;

        repository.Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var resetUrl = $"{_appSettings.PublicBaseUrl}/dat-lai-mat-khau?token={token}";
        await _emailService.SendAsync(
            customer.Email,
            "Đặt lại mật khẩu - Cloudverse",
            $"Nhấn vào link sau để đặt lại mật khẩu (hết hạn sau 1 giờ): {resetUrl}",
            cancellationToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Customer, Guid>();
        var now = DateTime.UtcNow;
        var customer = await repository.Query()
            .FirstOrDefaultAsync(
                c => c.PasswordResetToken == request.Token && c.PasswordResetExpiry.HasValue && c.PasswordResetExpiry.Value > now,
                cancellationToken)
            ?? throw new UnauthorizedAccessException("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");

        customer.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        customer.PasswordResetToken = null;
        customer.PasswordResetExpiry = null;
        // Buộc đăng nhập lại ở mọi thiết bị sau khi đặt lại mật khẩu - mirror ChangePasswordAsync.
        customer.RefreshToken = null;
        customer.RefreshTokenExpiryTime = null;
        customer.UpdatedAt = now;

        repository.Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static CustomerProfileDto ToProfileDto(Customer customer) => new()
    {
        Id = customer.Id,
        Email = customer.Email,
        FullName = customer.FullName,
        Phone = customer.Phone,
        CustomerType = customer.CustomerType.ToString(),
        CompanyName = customer.CompanyName,
        TaxCode = customer.TaxCode,
        IsEmailVerified = customer.IsEmailVerified,
        CreatedAt = customer.CreatedAt,
        UpdatedAt = customer.UpdatedAt
    };

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
            FullName = customer.FullName,
            Email = customer.Email
        };
    }
}
