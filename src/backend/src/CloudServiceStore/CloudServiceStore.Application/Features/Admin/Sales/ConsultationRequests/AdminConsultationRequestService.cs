using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Services;
using CloudServiceStore.Application.Features.Admin.Sales.ConsultationRequests.Dtos;
using CloudServiceStore.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Sales.ConsultationRequests;

public class AdminConsultationRequestService : IAdminConsultationRequestService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ConsultationStatusNotifier _consultationStatusNotifier;

    public AdminConsultationRequestService(IUnitOfWork unitOfWork, ConsultationStatusNotifier consultationStatusNotifier)
    {
        _unitOfWork = unitOfWork;
        _consultationStatusNotifier = consultationStatusNotifier;
    }

    public async Task<List<AdminConsultationRequestDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ConsultationRequest, int>();

        var entities = await repository.Query()
            .Include(c => c.AssignedToUser)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDto).ToList();
    }

    public async Task<AdminConsultationRequestDto> UpdateStatusAsync(int id, UpdateConsultationRequestStatusDto dto, Guid changedByUserId, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ConsultationRequest, int>();

        var entity = await repository.Query()
            .Include(c => c.AssignedToUser)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ConsultationRequest), id);
        }

        var oldStatus = entity.Status;
        entity.Status = dto.NewStatus;
        entity.AssignedToUserId ??= changedByUserId;
        entity.UpdatedAt = DateTime.UtcNow;

        repository.Update(entity);

        // Observer pattern (mirror OrderRequestStatusTransitionService.cs) - AuditLogConsultationObserver/
        // EmailConsultationObserver/NotificationConsultationObserver tự thêm việc vào cùng UnitOfWork -
        // chỉ SaveChanges 1 lần dưới đây để gộp chung transaction.
        await _consultationStatusNotifier.NotifyAsync(id, oldStatus, dto.NewStatus, changedByUserId, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    private static AdminConsultationRequestDto MapToDto(ConsultationRequest request)
    {
        return new AdminConsultationRequestDto
        {
            Id = request.Id,
            RequestCode = request.RequestCode,
            FullName = request.FullName,
            Email = request.Email,
            Phone = request.Phone,
            CompanyName = request.CompanyName,
            Subject = request.Subject,
            Message = request.Message,
            Status = request.Status.ToString(),
            AssignedToUserName = request.AssignedToUser?.FullName,
            CreatedAt = request.CreatedAt
        };
    }
}
