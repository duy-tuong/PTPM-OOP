using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Content.Faqs.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Content.Faqs;

public class FaqService : IFaqService
{
    private readonly IUnitOfWork _unitOfWork;

    public FaqService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<FaqDto>> GetListAsync(int? serviceCategoryId, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Faq, int>();

        var entities = await repository.Query()
            .Where(f => f.IsActive
                && (serviceCategoryId == null || f.ServiceCategoryId == serviceCategoryId))
            .OrderBy(f => f.DisplayOrder)
            .ToListAsync(cancellationToken);

        return entities.Select(f => new FaqDto
        {
            Id = f.Id,
            Question = f.Question,
            Answer = f.Answer,
            ServiceCategoryId = f.ServiceCategoryId,
            DisplayOrder = f.DisplayOrder
        }).ToList();
    }
}
