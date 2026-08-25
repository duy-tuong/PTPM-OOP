using CloudServiceStore.Application.Features.Customers.SshKeys.Dtos;

namespace CloudServiceStore.Application.Features.Customers.SshKeys;

public interface ICustomerSshKeyService
{
    Task<List<CustomerSshKeyDto>> GetMineAsync(Guid customerId, CancellationToken cancellationToken = default);

    Task<CustomerSshKeyDto> CreateAsync(Guid customerId, CreateSshKeyDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid customerId, int keyId, CancellationToken cancellationToken = default);
}
