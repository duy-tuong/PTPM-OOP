using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Sales.ConsultationRequests.Dtos;

namespace CloudServiceStore.Application.Features.Sales.ConsultationRequests;

public interface IConsultationRequestService
{
    Task<ConsultationRequestDto> CreateAsync(CreateConsultationRequestDto dto, Guid? customerId = null, CancellationToken cancellationToken = default);

    Task<PagedResult<MyConsultationRequestDto>> GetMineAsync(Guid customerId, PaginationParams query, CancellationToken cancellationToken = default);
}
