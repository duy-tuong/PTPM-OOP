namespace CloudServiceStore.Application.Features.Sales.ConsultationRequests.Dtos;

public class ConsultationRequestDto
{
    public int Id { get; init; }
    public string RequestCode { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}
