using System.ComponentModel.DataAnnotations;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Application.Features.Admin.Sales.ConsultationRequests.Dtos;

public class UpdateConsultationRequestStatusDto
{
    [Required, EnumDataType(typeof(ConsultationStatus))]
    public ConsultationStatus NewStatus { get; set; }
}
