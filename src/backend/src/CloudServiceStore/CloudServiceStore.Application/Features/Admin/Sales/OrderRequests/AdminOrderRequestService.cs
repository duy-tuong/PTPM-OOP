using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Common.Services;
using CloudServiceStore.Application.Features.Admin.Sales.OrderRequests.Dtos;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Sales.OrderRequests;

public class AdminOrderRequestService : IAdminOrderRequestService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly OrderStatusNotifier _orderStatusNotifier;

    public AdminOrderRequestService(IUnitOfWork unitOfWork, OrderStatusNotifier orderStatusNotifier)
    {
        _unitOfWork = unitOfWork;
        _orderStatusNotifier = orderStatusNotifier;
    }

    public async Task<PagedResult<AdminOrderRequestDto>> GetListAsync(OrderRequestQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<OrderRequest, int>();

        var baseQuery = repository.Query()
            .Include(o => o.ServicePlan)
            .Include(o => o.TldPricing)
            .Include(o => o.AssignedToUser)
            .Where(o => query.Status == null || o.Status == query.Status)
            .OrderByDescending(o => o.CreatedAt);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(MapToDto).ToList();
        return PagedResult<AdminOrderRequestDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<AdminOrderRequestDto> UpdateStatusAsync(int id, UpdateOrderRequestStatusDto dto, Guid changedByUserId, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<OrderRequest, int>();

        var entity = await repository.Query()
            .Include(o => o.ServicePlan)
            .Include(o => o.TldPricing)
            .Include(o => o.AssignedToUser)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(OrderRequest), id);
        }

        var oldStatus = entity.Status;
        if ((oldStatus == OrderRequestStatus.Completed || oldStatus == OrderRequestStatus.Cancelled)
            && dto.NewStatus != oldStatus)
        {
            throw new ValidationException("Đơn hàng đã ở trạng thái kết thúc (Hoàn tất/Đã huỷ), không thể chuyển sang trạng thái khác.");
        }

        entity.Status = dto.NewStatus;
        entity.AssignedToUserId ??= changedByUserId;
        entity.UpdatedAt = DateTime.UtcNow;

        repository.Update(entity);

        // Observer pattern (Phase 2.5): AuditLogOrderObserver tự thêm 1 dòng AuditLog vào cùng
        // UnitOfWork — chỉ SaveChanges 1 lần dưới đây để gộp chung transaction.
        await _orderStatusNotifier.NotifyAsync(entity.Id, oldStatus, dto.NewStatus, changedByUserId, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    private static AdminOrderRequestDto MapToDto(OrderRequest order)
    {
        return new AdminOrderRequestDto
        {
            Id = order.Id,
            OrderCode = order.OrderCode,
            CustomerType = order.CustomerType.ToString(),
            CustomerName = order.CustomerName,
            CustomerEmail = order.CustomerEmail,
            CustomerPhone = order.CustomerPhone,
            CompanyName = order.CompanyName,
            ServicePlanId = order.ServicePlanId,
            ServicePlanName = order.ServicePlan?.Name,
            TldPricingId = order.TldPricingId,
            TldName = order.TldPricing?.Tld,
            DomainName = order.DomainName,
            PeriodMonths = order.PeriodMonths,
            Quantity = order.Quantity,
            TotalPrice = order.TotalPrice,
            Note = order.Note,
            Status = order.Status.ToString(),
            AssignedToUserId = order.AssignedToUserId,
            AssignedToUserName = order.AssignedToUser?.FullName,
            Source = order.Source,
            CreatedAt = order.CreatedAt
        };
    }
}
