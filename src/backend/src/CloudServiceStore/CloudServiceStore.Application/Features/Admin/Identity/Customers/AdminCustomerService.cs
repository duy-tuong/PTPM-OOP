using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Identity.Customers.Dtos;
using CloudServiceStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Identity.Customers;

public class AdminCustomerService : IAdminCustomerService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminCustomerService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<AdminCustomerDto>> GetListAsync(CustomerQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Customer, Guid>();
        var search = query.Search;

        var baseQuery = repository.Query()
            .Include(c => c.AssignedSalesRepUser)
            .Where(c => search == null || c.Email.Contains(search) || c.FullName.Contains(search))
            .Where(c => query.CustomerType == null || c.CustomerType == query.CustomerType)
            .Where(c => query.AssignedSalesRepUserId == null || c.AssignedSalesRepUserId == query.AssignedSalesRepUserId)
            .OrderByDescending(c => c.CreatedAt);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(c => MapToDto(c)).ToList();
        return PagedResult<AdminCustomerDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<AdminCustomerDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _unitOfWork.Repository<Customer, Guid>().Query()
            .Include(c => c.AssignedSalesRepUser)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(Customer), id);
        }

        return MapToDto(entity);
    }

    public async Task<AdminCustomerDto> UpdateActiveStatusAsync(Guid id, UpdateCustomerActiveStatusDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Customer, Guid>();

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            throw new NotFoundException(nameof(Customer), id);
        }

        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    // CRM: Hồ sơ B2B & Sales Rep (Đợt 2, Phần 10).
    public async Task<AdminCustomerDto> UpdateAsync(Guid id, UpdateCustomerDto dto, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Customer, Guid>();
        var entity = await repository.Query()
            .Include(c => c.AssignedSalesRepUser)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(Customer), id);
        }

        if (dto.AssignedSalesRepUserId is not null)
        {
            var salesRepExists = await _unitOfWork.Repository<AppUser, Guid>().Query()
                .AnyAsync(u => u.Id == dto.AssignedSalesRepUserId.Value, cancellationToken);
            if (!salesRepExists)
            {
                throw new ValidationException("Nhân viên Sales phụ trách được chọn không tồn tại.");
            }
        }

        entity.BillingAddress = dto.BillingAddress;
        entity.LegalRepresentativeName = dto.LegalRepresentativeName;
        entity.BusinessLicenseNumber = dto.BusinessLicenseNumber;
        entity.CreditLimit = dto.CreditLimit;
        entity.AssignedSalesRepUserId = dto.AssignedSalesRepUserId;
        entity.UpdatedAt = DateTime.UtcNow;

        repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // AssignedSalesRepUser navigation có thể chưa phản ánh Id vừa gán (EF không tự reload navigation
        // sau khi chỉ đổi FK) - tra lại tên trực tiếp để trả DTO đúng ngay trong response này, tránh phải
        // gọi thêm 1 GetByIdAsync.
        var salesRepName = dto.AssignedSalesRepUserId is null
            ? null
            : (await _unitOfWork.Repository<AppUser, Guid>().GetByIdAsync(dto.AssignedSalesRepUserId.Value, cancellationToken))?.FullName;

        return MapToDto(entity, salesRepName);
    }

    private static AdminCustomerDto MapToDto(Customer customer, string? salesRepNameOverride = null)
    {
        return new AdminCustomerDto
        {
            Id = customer.Id,
            Email = customer.Email,
            FullName = customer.FullName,
            Phone = customer.Phone,
            CustomerType = customer.CustomerType.ToString(),
            CompanyName = customer.CompanyName,
            TaxCode = customer.TaxCode,
            IsEmailVerified = customer.IsEmailVerified,
            IsActive = customer.IsActive,
            CreatedAt = customer.CreatedAt,
            BillingAddress = customer.BillingAddress,
            LegalRepresentativeName = customer.LegalRepresentativeName,
            BusinessLicenseNumber = customer.BusinessLicenseNumber,
            CreditLimit = customer.CreditLimit,
            AssignedSalesRepUserId = customer.AssignedSalesRepUserId,
            AssignedSalesRepUserName = salesRepNameOverride ?? customer.AssignedSalesRepUser?.FullName
        };
    }
}
