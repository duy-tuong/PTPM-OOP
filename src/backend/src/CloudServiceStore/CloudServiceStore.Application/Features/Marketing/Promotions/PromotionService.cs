using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Marketing.Promotions.Dtos;
using CloudServiceStore.Domain.Entities.Marketing;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Marketing.Promotions;

public class PromotionService : IPromotionService
{
    private readonly IUnitOfWork _unitOfWork;

    public PromotionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<PromotionDto>> GetActiveListAsync(CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Promotion, int>();
        var now = DateTime.UtcNow;

        var entities = await repository.Query()
            .Where(p => p.IsActive
                && p.StartDate <= now
                && p.EndDate >= now
                && (p.UsageLimit == null || p.UsageCount < p.UsageLimit))
            .OrderBy(p => p.EndDate)
            .ToListAsync(cancellationToken);

        return entities.Select(p => new PromotionDto
        {
            Id = p.Id,
            Code = p.Code,
            Name = p.Name,
            Description = p.Description,
            DiscountType = p.DiscountType.ToString(),
            DiscountValue = p.DiscountValue,
            MaxDiscountAmount = p.MaxDiscountAmount,
            MinOrderValue = p.MinOrderValue,
            StartDate = p.StartDate,
            EndDate = p.EndDate
        }).ToList();
    }
}
