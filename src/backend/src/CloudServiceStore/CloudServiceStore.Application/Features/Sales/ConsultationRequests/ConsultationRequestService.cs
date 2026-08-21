using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Application.Common.Utils;
using CloudServiceStore.Application.Features.Sales.ConsultationRequests.Dtos;
using CloudServiceStore.Domain.Entities.Sales;

namespace CloudServiceStore.Application.Features.Sales.ConsultationRequests;

public class ConsultationRequestService : IConsultationRequestService
{
    private readonly IUnitOfWork _unitOfWork;

    public ConsultationRequestService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ConsultationRequestDto> CreateAsync(CreateConsultationRequestDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new ConsultationRequest
        {
            RequestCode = RequestCodeGenerator.Generate("CSL"),
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
}
