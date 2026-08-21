namespace CloudServiceStore.Application.Features.Sales.ConsultationRequests.Dtos;

// Bản mỏng của AdminConsultationRequestDto - bỏ AssignedToUserName (chi tiết nội bộ), dùng cho
// GET /api/consultation-requests/mine.
public class MyConsultationRequestDto
{
    public int Id { get; init; }
    public string RequestCode { get; init; } = string.Empty;
    public string Subject { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}
