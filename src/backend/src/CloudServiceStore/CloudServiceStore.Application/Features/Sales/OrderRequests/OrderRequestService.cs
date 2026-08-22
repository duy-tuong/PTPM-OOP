using System.Text.RegularExpressions;
using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Common.Utils;
using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Entities.Marketing;
using CloudServiceStore.Domain.Entities.Sales;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Sales.OrderRequests;

public class OrderRequestService : IOrderRequestService
{
    // Nhãn tên miền (phần trước dấu chấm, chưa gồm TLD) - không cho bắt đầu/kết thúc bằng gạch ngang,
    // chỉ chữ/số/gạch ngang, tối đa 63 ký tự (giới hạn nhãn DNS chuẩn).
    private static readonly Regex DomainLabelPattern = new(@"^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$", RegexOptions.Compiled);

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

        Promotion? promotion = null;
        if (dto.PromotionId is not null)
        {
            promotion = await _unitOfWork.Repository<Promotion, int>().Query()
                .Include(p => p.Scopes)
                .FirstOrDefaultAsync(p => p.Id == dto.PromotionId.Value, cancellationToken);
            if (promotion is null)
            {
                throw new NotFoundException(nameof(Promotion), dto.PromotionId.Value);
            }

            var now = DateTime.UtcNow;
            var isEligible = promotion.IsActive
                && promotion.StartDate <= now
                && promotion.EndDate >= now
                && (promotion.UsageLimit == null || promotion.UsageCount < promotion.UsageLimit);

            if (!isEligible)
            {
                throw new ValidationException("Mã khuyến mãi không còn hiệu lực.");
            }
        }

        if (dto.ServicePlanId is not null)
        {
            var plan = await planRepository.GetByIdAsync(dto.ServicePlanId.Value, cancellationToken);
            if (plan is null)
            {
                throw new NotFoundException(nameof(ServicePlan), dto.ServicePlanId.Value);
            }

            if (!plan.IsActive)
            {
                throw new ValidationException("Gói dịch vụ này hiện không khả dụng để đặt mua.");
            }

            var priceQuery = priceRepository.Query()
                .Where(p => p.PlanId == dto.ServicePlanId.Value && p.IsActive);

            var price = dto.PeriodMonths is not null
                ? await priceQuery.FirstOrDefaultAsync(p => p.PeriodMonths == dto.PeriodMonths.Value, cancellationToken)
                : await priceQuery.FirstOrDefaultAsync(p => p.IsDefault, cancellationToken);

            if (price is null)
            {
                throw new ValidationException("Gói dịch vụ chưa có giá cho kỳ hạn đã chọn.");
            }

            totalPrice = (price.PromotionalPrice ?? price.Price) * dto.Quantity;

            if (promotion is not null)
            {
                totalPrice = ApplyPromotion(promotion, planId: plan.Id, categoryId: plan.CategoryId, totalPrice);
            }
        }

        string? domainName = null;
        if (dto.TldPricingId is not null)
        {
            var tldPricing = await _unitOfWork.Repository<TldPricing, int>().GetByIdAsync(dto.TldPricingId.Value, cancellationToken);
            if (tldPricing is null)
            {
                throw new NotFoundException(nameof(TldPricing), dto.TldPricingId.Value);
            }

            if (!tldPricing.IsActive)
            {
                throw new ValidationException("Tên miền này hiện không khả dụng để đặt mua.");
            }

            domainName = dto.DomainName?.Trim();
            if (string.IsNullOrEmpty(domainName) || !DomainLabelPattern.IsMatch(domainName))
            {
                throw new ValidationException("Vui lòng nhập tên miền hợp lệ (chỉ chữ, số, gạch ngang, không có dấu chấm).");
            }

            totalPrice = tldPricing.RegisterPrice * dto.Quantity;

            if (promotion is not null)
            {
                totalPrice = ApplyPromotion(promotion, planId: null, categoryId: tldPricing.ServiceCategoryId, totalPrice);
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
            DomainName = domainName,
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
            .Include(o => o.TldPricing)
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
            TldName = o.TldPricing?.Tld,
            DomainName = o.DomainName,
            PeriodMonths = o.PeriodMonths,
            Quantity = o.Quantity,
            TotalPrice = o.TotalPrice,
            Status = o.Status.ToString(),
            CreatedAt = o.CreatedAt
        }).ToList();

        return PagedResult<MyOrderRequestDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    // planId: chỉ set khi đặt ServicePlan (PromotionScope.ServicePlanId chỉ FK tới ServicePlan, TLD
    // không có scope riêng theo từng tên miền - chỉ theo ServiceCategory hoặc "Toàn bộ").
    private static decimal ApplyPromotion(Promotion promotion, int? planId, int? categoryId, decimal totalPrice)
    {
        // Chưa cấu hình scope nào (VD: dữ liệu mẫu WELCOME2026 seed sẵn) = không giới hạn, áp dụng cho
        // mọi sản phẩm - mirror đúng kỳ vọng của Admin khi tạo khuyến mãi mà không chọn phạm vi cụ thể nào.
        var scopeMatches = promotion.Scopes.Count == 0
            || promotion.Scopes.Any(s => s.ScopeType == ScopeType.All
                || (s.ScopeType == ScopeType.Plan && planId is not null && s.ServicePlanId == planId)
                || (s.ScopeType == ScopeType.Category && categoryId is not null && s.ServiceCategoryId == categoryId));

        if (!scopeMatches)
        {
            throw new ValidationException("Mã khuyến mãi không áp dụng cho sản phẩm này.");
        }

        if (promotion.MinOrderValue is not null && totalPrice < promotion.MinOrderValue)
        {
            throw new ValidationException($"Đơn hàng cần tối thiểu {promotion.MinOrderValue:N0}đ để áp dụng mã khuyến mãi này.");
        }

        var discount = promotion.DiscountType == DiscountType.Percentage
            ? totalPrice * promotion.DiscountValue / 100m
            : promotion.DiscountValue;

        if (promotion.MaxDiscountAmount is not null && discount > promotion.MaxDiscountAmount)
        {
            discount = promotion.MaxDiscountAmount.Value;
        }

        return Math.Max(0, totalPrice - discount);
    }
}
