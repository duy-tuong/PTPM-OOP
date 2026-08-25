using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Catalog.ServicePlans.Dtos;
using CloudServiceStore.Domain.Entities.Catalog;
using CloudServiceStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Catalog.ServicePlans;

public class ServicePlanService : IServicePlanService
{
    private readonly IUnitOfWork _unitOfWork;

    public ServicePlanService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<ServicePlanListItemDto>> GetListAsync(ServicePlanQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ServicePlan, int>();

        var baseQuery = repository.Query()
            .Include(p => p.Category)
            .Include(p => p.Prices)
            .Include(p => p.Features)
            .Where(p => p.Status == ServicePlanStatus.Active
                && (query.CategorySlug == null || p.Category.Slug == query.CategorySlug)
                && (query.IsFeatured == null || p.IsFeatured == query.IsFeatured))
            .OrderBy(p => p.DisplayOrder);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(MapToListItemDto).ToList();
        return PagedResult<ServicePlanListItemDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }

    public async Task<ServicePlanDetailDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ServicePlan, int>();

        var entity = await repository.Query()
            .Include(p => p.Category)
            .Include(p => p.Features)
            .Include(p => p.Prices)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.Status == ServicePlanStatus.Active, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ServicePlan), slug);
        }

        return MapToDetailDto(entity);
    }

    private static ServicePlanListItemDto MapToListItemDto(ServicePlan plan)
    {
        var activePrices = plan.Prices.Where(x => x.IsActive).ToList();

        return new ServicePlanListItemDto
        {
            Id = plan.Id,
            Name = plan.Name,
            Slug = plan.Slug,
            ShortDescription = plan.ShortDescription,
            IsFeatured = plan.IsFeatured,
            QrCodeUrl = plan.QrCodeUrl,
            CategoryName = plan.Category.Name,
            CategorySlug = plan.Category.Slug,
            StartingPrice = activePrices.Count == 0
                ? null
                : activePrices.Min(x => x.PromotionalPrice ?? x.Price),
            Features = plan.Features
                .OrderBy(f => f.DisplayOrder)
                .Select(f => new PlanFeatureDto
                {
                    FeatureKey = f.FeatureKey,
                    FeatureLabel = f.FeatureLabel,
                    FeatureValueText = f.FeatureValueText,
                    FeatureValueNumeric = f.FeatureValueNumeric,
                    FeatureUnit = f.FeatureUnit,
                    IsHighlighted = f.IsHighlighted
                })
                .ToList(),
            Prices = activePrices
                .Select(p => new PlanPriceDto
                {
                    PeriodMonths = p.PeriodMonths,
                    Price = p.Price,
                    PromotionalPrice = p.PromotionalPrice,
                    Currency = p.Currency,
                    IsDefault = p.IsDefault
                })
                .ToList()
        };
    }

    private static ServicePlanDetailDto MapToDetailDto(ServicePlan plan)
    {
        return new ServicePlanDetailDto
        {
            Id = plan.Id,
            Name = plan.Name,
            Slug = plan.Slug,
            ShortDescription = plan.ShortDescription,
            Description = plan.Description,
            IsFeatured = plan.IsFeatured,
            QrCodeUrl = plan.QrCodeUrl,
            CategoryName = plan.Category.Name,
            CategorySlug = plan.Category.Slug,
            Features = plan.Features
                .OrderBy(f => f.DisplayOrder)
                .Select(f => new PlanFeatureDto
                {
                    FeatureKey = f.FeatureKey,
                    FeatureLabel = f.FeatureLabel,
                    FeatureValueText = f.FeatureValueText,
                    FeatureValueNumeric = f.FeatureValueNumeric,
                    FeatureUnit = f.FeatureUnit,
                    IsHighlighted = f.IsHighlighted
                })
                .ToList(),
            Prices = plan.Prices
                .Where(p => p.IsActive)
                .Select(p => new PlanPriceDto
                {
                    PeriodMonths = p.PeriodMonths,
                    Price = p.Price,
                    PromotionalPrice = p.PromotionalPrice,
                    Currency = p.Currency,
                    IsDefault = p.IsDefault
                })
                .ToList()
        };
    }
}
