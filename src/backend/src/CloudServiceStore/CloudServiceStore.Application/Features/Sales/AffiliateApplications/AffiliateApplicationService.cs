using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Sales.AffiliateApplications.Dtos;
using CloudServiceStore.Domain.Entities.Sales;

namespace CloudServiceStore.Application.Features.Sales.AffiliateApplications;

public class AffiliateApplicationService : IAffiliateApplicationService
{
    private readonly IUnitOfWork _unitOfWork;

    public AffiliateApplicationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<AffiliateApplicationDto> CreateAsync(CreateAffiliateApplicationDto dto, Guid? customerId = null, CancellationToken cancellationToken = default)
    {
        var entity = new AffiliateApplication
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            WebsiteUrl = dto.WebsiteUrl,
            PromotionPlan = dto.PromotionPlan,
            CustomerId = customerId,
            CreatedAt = DateTime.UtcNow
        };

        var repository = _unitOfWork.Repository<AffiliateApplication, int>();
        await repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AffiliateApplicationDto
        {
            Id = entity.Id,
            Status = entity.Status.ToString(),
            CreatedAt = entity.CreatedAt
        };
    }
}
