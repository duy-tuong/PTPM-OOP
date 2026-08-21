using CloudServiceStore.Application.Features.Content.NewsCategories.Dtos;

namespace CloudServiceStore.Application.Features.Content.NewsCategories;

public interface INewsCategoryService
{
    Task<List<NewsCategoryDto>> GetListAsync(CancellationToken cancellationToken = default);
}
