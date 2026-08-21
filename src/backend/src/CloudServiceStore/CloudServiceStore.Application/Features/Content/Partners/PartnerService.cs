using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Features.Content.Partners.Dtos;
using CloudServiceStore.Domain.Entities.Content;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Content.Partners;

public class PartnerService : IPartnerService
{
    private readonly IUnitOfWork _unitOfWork;

    public PartnerService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<PartnerDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<Partner, int>();

        var entities = await repository.Query()
            .Where(p => p.IsActive)
            .OrderBy(p => p.DisplayOrder)
            .ToListAsync(cancellationToken);

        return entities.Select(p => new PartnerDto
        {
            Id = p.Id,
            Name = p.Name,
            LogoUrl = p.LogoUrl,
            WebsiteUrl = p.WebsiteUrl,
            DisplayOrder = p.DisplayOrder
        }).ToList();
    }
}
