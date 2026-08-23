using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests;

public interface IOrderRequestService
{
    Task<OrderRequestDto> CreateAsync(CreateOrderRequestDto dto, Guid? customerId = null, CancellationToken cancellationToken = default);

    Task<PagedResult<MyOrderRequestDto>> GetMineAsync(Guid customerId, PaginationParams query, CancellationToken cancellationToken = default);

    Task<OrderLookupDto> GetByCodeAsync(string orderCode, CancellationToken cancellationToken = default);

    Task<OrderRequestDto> CreateRenewalAsync(CreateRenewalOrderRequestDto dto, Guid customerId, CancellationToken cancellationToken = default);

    Task<PagedResult<MyServiceItemDto>> GetMyServicesAsync(Guid customerId, PaginationParams query, CancellationToken cancellationToken = default);
}
