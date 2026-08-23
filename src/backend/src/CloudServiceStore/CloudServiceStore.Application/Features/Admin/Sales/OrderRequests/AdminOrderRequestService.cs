using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Sales.OrderRequests.Dtos;
using CloudServiceStore.Application.Features.Sales.OrderRequests;
using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;
using CloudServiceStore.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Admin.Sales.OrderRequests;

public class AdminOrderRequestService : IAdminOrderRequestService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IOrderRequestStatusTransitionService _transitionService;

    public AdminOrderRequestService(IUnitOfWork unitOfWork, IOrderRequestStatusTransitionService transitionService)
    {
        _unitOfWork = unitOfWork;
        _transitionService = transitionService;
    }

    public async Task<PagedResult<AdminOrderRequestDto>> GetListAsync(OrderRequestQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<OrderRequest, int>();

        var baseQuery = repository.Query()
            .Include(o => o.Items).ThenInclude(i => i.ServicePlan)
            .Include(o => o.Items).ThenInclude(i => i.TldPricing)
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
        var entity = await _transitionService.TransitionAsync(id, dto.NewStatus, changedByUserId, cancellationToken);
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
            Items = order.Items.Select(OrderRequestItemDto.FromEntity).ToList(),
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
