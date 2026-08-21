using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Models;
using CloudServiceStore.Application.Common.Utils;
using CloudServiceStore.Application.Features.Sales.ConsultationRequests.Dtos;
using CloudServiceStore.Domain.Entities.Sales;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.Application.Features.Sales.ConsultationRequests;

public class ConsultationRequestService : IConsultationRequestService
{
    private readonly IUnitOfWork _unitOfWork;

    public ConsultationRequestService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ConsultationRequestDto> CreateAsync(CreateConsultationRequestDto dto, Guid? customerId = null, CancellationToken cancellationToken = default)
    {
        var entity = new ConsultationRequest
        {
            RequestCode = RequestCodeGenerator.Generate("CSL"),
            CustomerId = customerId,
            CustomerType = dto.CustomerType,
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            CompanyName = dto.CompanyName,
            ServiceCategoryId = dto.ServiceCategoryId,
            Subject = dto.Subject,
            Message = dto.Message,
            Source = "public-website",
            CreatedAt = DateTime.UtcNow
        };

        var repository = _unitOfWork.Repository<ConsultationRequest, int>();
        await repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ConsultationRequestDto
        {
            Id = entity.Id,
            RequestCode = entity.RequestCode,
            Status = entity.Status.ToString(),
            CreatedAt = entity.CreatedAt
        };
    }

    public async Task<PagedResult<MyConsultationRequestDto>> GetMineAsync(Guid customerId, PaginationParams query, CancellationToken cancellationToken = default)
    {
        var repository = _unitOfWork.Repository<ConsultationRequest, int>();

        var baseQuery = repository.Query()
            .Where(c => c.CustomerId == customerId)
            .OrderByDescending(c => c.CreatedAt);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var entities = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = entities.Select(c => new MyConsultationRequestDto
        {
            Id = c.Id,
            RequestCode = c.RequestCode,
            Subject = c.Subject,
            Message = c.Message,
            Status = c.Status.ToString(),
            CreatedAt = c.CreatedAt
        }).ToList();

        return PagedResult<MyConsultationRequestDto>.Create(dtos, totalCount, query.PageNumber, query.PageSize);
    }
}
