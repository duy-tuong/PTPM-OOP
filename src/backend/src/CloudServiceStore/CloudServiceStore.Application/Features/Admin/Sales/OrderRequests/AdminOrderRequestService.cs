using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Admin.Sales.OrderRequests.Dtos;
using CloudServiceStore.Application.Features.Sales.OrderRequests;
using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;
using CloudServiceStore.Domain.Entities.Identity;
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
            .Include(o => o.Items).ThenInclude(i => i.Addons).ThenInclude(a => a.Addon)
            .Include(o => o.AssignedToUser)
            .Where(o => query.Status == null || o.Status == query.Status)
            .Where(o => query.FlaggedOnly != true || o.IsFlaggedForReview)
            .Where(o => query.Search == null || o.OrderCode.Contains(query.Search) || o.CustomerName.Contains(query.Search) || o.CustomerEmail.Contains(query.Search))
            .OrderByDescending(o => o.CreatedAt);


        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);


        var dtos = entities.Select(o => MapToDto(o)).ToList();
        return PagedResult<AdminOrderRequestDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }


    public async Task<AdminOrderRequestDto> UpdateStatusAsync(int id, UpdateOrderRequestStatusDto dto, Guid changedByUserId, CancellationToken cancellationToken = default)
    {
        var entity = await _transitionService.TransitionAsync(id, dto.NewStatus, changedByUserId, cancellationToken);
        return MapToDto(entity);
    }


    public async Task<AdminOrderRequestDto> LiftSuspensionAsync(int itemId, CancellationToken cancellationToken = default)
    {
        var itemRepository = _unitOfWork.Repository<OrderRequestItem, int>();
        var item = await itemRepository.Query()
            .Include(i => i.OrderRequest).ThenInclude(o => o.Items).ThenInclude(i => i.ServicePlan)
            .Include(i => i.OrderRequest).ThenInclude(o => o.Items).ThenInclude(i => i.TldPricing)
            .Include(i => i.OrderRequest).ThenInclude(o => o.Items).ThenInclude(i => i.Addons).ThenInclude(a => a.Addon)
            .Include(i => i.OrderRequest).ThenInclude(o => o.AssignedToUser)
            .FirstOrDefaultAsync(i => i.Id == itemId, cancellationToken);


        if (item is null)
        {
            throw new NotFoundException(nameof(OrderRequestItem), itemId);
        }


        if (item.TerminatedAt is not null)
        {
            throw new ValidationException("Dịch vụ đã bị hủy hẳn (quá hạn quá lâu, dữ liệu bàn giao đã bị xoá) - không thể gỡ khóa, cần tạo gia hạn/bàn giao lại thủ công nếu muốn khôi phục.");
        }


        if (item.SuspendedAt is null && item.TerminationWarningSentAt is null)
        {
            throw new ValidationException("Dịch vụ này hiện không bị tạm khóa.");
        }


        item.SuspendedAt = null;
        item.TerminationWarningSentAt = null;
        itemRepository.Update(item);
        await _unitOfWork.SaveChangesAsync(cancellationToken);


        return MapToDto(item.OrderRequest);
    }


    public async Task<AdminOrderRequestDto> AssignAsync(int id, AssignOrderRequestDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await LoadOrderAsync(id, cancellationToken);


        if (dto.AssignedToUserId is not null)
        {
            var userExists = await _unitOfWork.Repository<AppUser, Guid>().Query()
                .AnyAsync(u => u.Id == dto.AssignedToUserId.Value, cancellationToken);
            if (!userExists)
            {
                throw new ValidationException("Nhân viên được chọn không tồn tại.");
            }
        }


        entity.AssignedToUserId = dto.AssignedToUserId;
        _unitOfWork.Repository<OrderRequest, int>().Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);


        // Navigation AssignedToUser có thể chưa phản ánh Id vừa gán (EF không tự reload navigation sau
        // khi chỉ đổi FK) - tra lại tên trực tiếp để trả DTO đúng ngay, mirror
        // AdminCustomerService.UpdateAsync xử lý AssignedSalesRepUser.
        var assignedToUserName = dto.AssignedToUserId is null
            ? null
            : (await _unitOfWork.Repository<AppUser, Guid>().GetByIdAsync(dto.AssignedToUserId.Value, cancellationToken))?.FullName;


        return MapToDto(entity, assignedToUserName);
    }


    public async Task<AdminOrderRequestDto> ClearFraudFlagAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await LoadOrderAsync(id, cancellationToken);


        if (!entity.IsFlaggedForReview)
        {
            throw new ValidationException("Đơn này hiện không bị đánh dấu nghi vấn.");
        }


        entity.IsFlaggedForReview = false;
        entity.FlagReason = null;
        _unitOfWork.Repository<OrderRequest, int>().Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);


        return MapToDto(entity);
    }


    private async Task<OrderRequest> LoadOrderAsync(int id, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.Repository<OrderRequest, int>().Query()
            .Include(o => o.Items).ThenInclude(i => i.ServicePlan)
            .Include(o => o.Items).ThenInclude(i => i.TldPricing)
            .Include(o => o.Items).ThenInclude(i => i.Addons).ThenInclude(a => a.Addon)
            .Include(o => o.AssignedToUser)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);


        if (entity is null)
        {
            throw new NotFoundException(nameof(OrderRequest), id);
        }


        return entity;
    }


    private static AdminOrderRequestDto MapToDto(OrderRequest order, string? assignedToUserNameOverride = null)
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
            AssignedToUserName = assignedToUserNameOverride ?? order.AssignedToUser?.FullName,
            Source = order.Source,
            CreatedAt = order.CreatedAt,
            IsFlaggedForReview = order.IsFlaggedForReview,
            FlagReason = order.FlagReason,
            PaidAt = order.PaidAt,
            PayOsPaymentLinkId = order.PayOsPaymentLinkId
        };
    }
}



