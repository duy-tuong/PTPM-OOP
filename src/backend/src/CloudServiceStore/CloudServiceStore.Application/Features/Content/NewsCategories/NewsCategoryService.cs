using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Content.NewsCategories.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Content.NewsCategories;

public class NewsCategoryService : INewsCategoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public NewsCategoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<NewsCategoryDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<NewsCategory, int>();

        var entities = await repository.Query()
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync(cancellationToken);

        return entities.Select(c => new NewsCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            Description = c.Description,
            DisplayOrder = c.DisplayOrder
        }).ToList();
    }
}
