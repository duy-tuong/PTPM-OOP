using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Entities.System;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Observers;
using Moq;

namespace CloudServiceStore.Tests.Infrastructure.Observers;

public class AuditLogOrderObserverTests
{
    [Fact]
    public async Task OnStatusChangedAsync_AddsAuditLogWithExpectedFields_AndDoesNotSaveChanges()
    {
        var repositoryMock = new Mock<IRepository<AuditLog, long>>();
        var unitOfWorkMock = new Mock<IUnitOfWork>();
        unitOfWorkMock.Setup(u => u.Repository<AuditLog, long>()).Returns(repositoryMock.Object);

        var sut = new AuditLogOrderObserver(unitOfWorkMock.Object);
        var changedByUserId = Guid.NewGuid();

        await sut.OnStatusChangedAsync(42, OrderRequestStatus.New, OrderRequestStatus.Contacted, changedByUserId);

        repositoryMock.Verify(r => r.AddAsync(It.Is<AuditLog>(log =>
            log.UserId == changedByUserId &&
            log.Action == AuditAction.StatusChange &&
            log.EntityName == nameof(OrderRequest) &&
            log.EntityId == "42" &&
            log.OldValues == nameof(OrderRequestStatus.New) &&
            log.NewValues == nameof(OrderRequestStatus.Contacted)),
            It.IsAny<CancellationToken>()), Times.Once);

        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
