using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Common.Utils;
using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests;

public class OrderRequestService : IOrderRequestService
{
    private readonly IUnitOfWork _unitOfWork;

    public OrderRequestService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<OrderRequestDto> CreateAsync(CreateOrderRequestDto dto, Guid? customerId = null, CancellationToken cancellationToken = default)
    {
        var planRepository = _unitOfWork.Repository<ServicePlan, int>();
        var priceRepository = _unitOfWork.Repository<PlanPrice, int>();

        decimal totalPrice = 0;

        if (dto.ServicePlanId is not null)
        {
            var plan = await planRepository.GetByIdAsync(dto.ServicePlanId.Value, cancellationToken);
            if (plan is null)
            {
                throw new NotFoundException(nameof(ServicePlan), dto.ServicePlanId.Value);
            }

            var priceQuery = priceRepository.Query()
                .Where(p => p.PlanId == dto.ServicePlanId.Value && p.IsActive);

            var price = dto.PeriodMonths is not null
                ? await priceQuery.FirstOrDefaultAsync(p => p.PeriodMonths == dto.PeriodMonths.Value, cancellationToken)
                : await priceQuery.FirstOrDefaultAsync(p => p.IsDefault, cancellationToken);

            if (price is not null)
            {
                totalPrice = (price.PromotionalPrice ?? price.Price) * dto.Quantity;
            }
        }

        var orderRequest = new OrderRequest
        {
            OrderCode = RequestCodeGenerator.Generate("ORD"),
            CustomerId = customerId,
            CustomerType = dto.CustomerType,
            CustomerName = dto.CustomerName,
            CustomerEmail = dto.CustomerEmail,
            CustomerPhone = dto.CustomerPhone,
            CompanyName = dto.CompanyName,
            TaxCode = dto.TaxCode,
            ServicePlanId = dto.ServicePlanId,
            TldPricingId = dto.TldPricingId,
            PeriodMonths = dto.PeriodMonths,
            PromotionId = dto.PromotionId,
            Quantity = dto.Quantity,
            TotalPrice = totalPrice,
            Note = dto.Note,
            Source = "public-website",
            CreatedAt = DateTime.UtcNow
        };

        var orderRepository = _unitOfWork.Repository<OrderRequest, int>();
        await orderRepository.AddAsync(orderRequest, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new OrderRequestDto
        {
            Id = orderRequest.Id,
            OrderCode = orderRequest.OrderCode,
            Status = orderRequest.Status.ToString(),
            TotalPrice = orderRequest.TotalPrice,
            CreatedAt = orderRequest.CreatedAt
        };
    }

    public async Task<PagedResult<MyOrderRequestDto>> GetMineAsync(Guid customerId, PaginationParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<OrderRequest, int>();

        var baseQuery = repository.Query()
            .Include(o => o.ServicePlan)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(o => new MyOrderRequestDto
        {
            Id = o.Id,
            OrderCode = o.OrderCode,
            ServicePlanName = o.ServicePlan?.Name,
            PeriodMonths = o.PeriodMonths,
            Quantity = o.Quantity,
            TotalPrice = o.TotalPrice,
            Status = o.Status.ToString(),
            CreatedAt = o.CreatedAt
        }).ToList();

        return PagedResult<MyOrderRequestDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }
}
