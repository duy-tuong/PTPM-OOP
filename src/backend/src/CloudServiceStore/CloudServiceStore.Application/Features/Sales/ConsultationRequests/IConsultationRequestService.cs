using CloudServiceStore.Application.Features.Sales.ConsultationRequests.Dtos;

namespace CloudServiceStore.Application.Features.Sales.ConsultationRequests;

public interface IConsultationRequestService
{
    Task<ConsultationRequestDto> CreateAsync(CreateConsultationRequestDto dto, CancellationToken cancellationToken = default);
}
