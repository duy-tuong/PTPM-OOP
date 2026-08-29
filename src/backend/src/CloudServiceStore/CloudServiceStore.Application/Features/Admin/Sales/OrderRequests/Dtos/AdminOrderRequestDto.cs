 using CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;


namespace CloudServiceStore.Application.Features.Admin.Sales.OrderRequests.Dtos;


public class AdminOrderRequestDto
{
    public int Id { get; init; }
    public string OrderCode { get; init; } = string.Empty;
    public string CustomerType { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public string CustomerEmail { get; init; } = string.Empty;
    public string CustomerPhone { get; init; } = string.Empty;
    public string? CompanyName { get; init; }
    public List<OrderRequestItemDto> Items { get; init; } = new();
    public decimal TotalPrice { get; init; }
    public string? Note { get; init; }
    public string Status { get; init; } = string.Empty;
    public Guid? AssignedToUserId { get; init; }
    public string? AssignedToUserName { get; init; }
    public string? Source { get; init; }
    public DateTime CreatedAt { get; init; }


    // Fraud Review (Đợt 2, Phần 9) - xem OrderRequestService.EvaluateFraudRiskAsync.
    public bool IsFlaggedForReview { get; init; }
    public string? FlagReason { get; init; }


    // Đợt 13, Phần 4 (D1/D2) - trước đây 2 field này đã có sẵn trên entity (set lúc webhook PayOS xác
    // nhận thanh toán) nhưng chưa từng expose ra DTO Admin - Admin không có cách biết đơn đã thu tiền
    // lúc nào, cũng không đối chiếu được với PayOS qua mã giao dịch. Cả 2 null nếu đơn chưa Paid.
    public DateTime? PaidAt { get; init; }
    public string? PayOsPaymentLinkId { get; init; }
}



