using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests;

public interface IOrderRequestService
{
    Task<OrderRequestDto> CreateAsync(CreateOrderRequestDto dto, CancellationToken cancellationToken = default);
}
