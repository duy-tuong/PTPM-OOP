namespace CloudServiceStore.Application.Features.Admin.Sales.ConsultationRequests.Dtos;

public class AdminConsultationRequestDto
{
    public int Id { get; init; }
    public string RequestCode { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Phone { get; init; } = string.Empty;
    public string? CompanyName { get; init; }
    public string Subject { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string? AssignedToUserName { get; init; }
    public DateTime CreatedAt { get; init; }
}
