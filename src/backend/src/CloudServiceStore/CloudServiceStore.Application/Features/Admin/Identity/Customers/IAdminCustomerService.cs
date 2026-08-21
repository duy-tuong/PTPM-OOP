using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Identity.Customers.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Identity.Customers;

public interface IAdminCustomerService
{
    Task<PagedResult<AdminCustomerDto>> GetListAsync(CustomerQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminCustomerDto> UpdateActiveStatusAsync(Guid id, UpdateCustomerActiveStatusDto dto, CancellationToken cancellationToken = default);
}
