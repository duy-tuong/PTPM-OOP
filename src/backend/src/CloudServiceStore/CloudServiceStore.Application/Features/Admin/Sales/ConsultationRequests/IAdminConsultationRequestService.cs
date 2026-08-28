using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Sales.ConsultationRequests.Dtos;

namespace CloudServiceStore.Application.Features.Admin.Sales.ConsultationRequests;

public interface IAdminConsultationRequestService
{
    Task<PagedResult<AdminConsultationRequestDto>> GetListAsync(ConsultationRequestQueryParams query, CancellationToken cancellationToken = default);

    Task<AdminConsultationRequestDto> UpdateStatusAsync(int id, UpdateConsultationRequestStatusDto dto, Guid changedByUserId, CancellationToken cancellationToken = default);
}
