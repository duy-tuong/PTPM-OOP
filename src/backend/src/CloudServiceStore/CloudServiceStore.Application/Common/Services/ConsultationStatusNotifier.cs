using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Common.Services;

// Observer pattern - phần "Subject", mirror OrderStatusNotifier.cs 1-1 cho ConsultationRequest.
public class ConsultationStatusNotifier
{
    private readonly IEnumerable<IConsultationStatusObserver> _observers;

    public ConsultationStatusNotifier(IEnumerable<IConsultationStatusObserver> observers)
    {
        _observers = observers;
    }

    public async Task NotifyAsync(
        int consultationRequestId,
        ConsultationStatus oldStatus,
        ConsultationStatus newStatus,
        Guid? changedByUserId,
        CancellationToken cancellationToken = default)
    {
        foreach (var observer in _observers)
        {
            await observer.OnStatusChangedAsync(consultationRequestId, oldStatus, newStatus, changedByUserId, cancellationToken);
        }
    }
}
