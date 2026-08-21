using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Features.Catalog.TldPricings.Dtos;
using Microsoft.EntityFrameworkCore;
using DomainTldPricing = CloudServiceStore.Domain.Entities.Catalog.TldPricing;

namespace CloudServiceStore.Application.Features.Catalog.TldPricings;

public class TldPricingService : ITldPricingService
{
    private readonly IUnitOfWork _unitOfWork;

    public TldPricingService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<TldPricingDto>> GetListAsync(TldPricingQueryParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<DomainTldPricing, int>();

        var baseQuery = repository.Query()
            .Include(t => t.ServiceCategory)
            .Where(t => t.IsActive
                && (query.CategorySlug == null || (t.ServiceCategory != null && t.ServiceCategory.Slug == query.CategorySlug)))
            .OrderBy(t => t.Tld);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(t => new TldPricingDto
        {
            Id = t.Id,
            Tld = t.Tld,
            ServiceCategoryName = t.ServiceCategory?.Name,
            RegisterPrice = t.RegisterPrice,
            RenewPrice = t.RenewPrice,
            TransferPrice = t.TransferPrice,
            Currency = t.Currency
        }).ToList();

        return PagedResult<TldPricingDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }
}
