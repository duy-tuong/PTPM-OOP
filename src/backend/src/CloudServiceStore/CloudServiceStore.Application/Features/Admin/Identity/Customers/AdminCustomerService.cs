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
            .Where(c => search == null || c.Email.Contains(search) || c.FullName.Contains(search))
            .OrderByDescending(c => c.CreatedAt);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(MapToDto).ToList();
        return PagedResult<AdminCustomerDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
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

    private static AdminCustomerDto MapToDto(Customer customer)
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
            CreatedAt = customer.CreatedAt
        };
    }
}
