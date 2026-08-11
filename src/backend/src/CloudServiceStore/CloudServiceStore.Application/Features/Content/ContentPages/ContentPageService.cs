using CloudServiceStore.Application.Common.Exceptions;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Content.ContentPages.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Content.ContentPages;

public class ContentPageService : IContentPageService
{
    private readonly IUnitOfWork _unitOfWork;

    public ContentPageService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ContentPageDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ContentPage, int>();

        var entity = await repository.Query()
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsPublished, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(ContentPage), slug);
        }

        return new ContentPageDto
        {
            Id = entity.Id,
            Slug = entity.Slug,
            Title = entity.Title,
            Content = entity.Content,
            MetaTitle = entity.MetaTitle,
            MetaDescription = entity.MetaDescription,
            PublishedAt = entity.PublishedAt
        };
    }
}
