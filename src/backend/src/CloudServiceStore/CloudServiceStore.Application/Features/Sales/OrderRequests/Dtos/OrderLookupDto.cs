namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

public class OrderLookupItemDto
{
    public string ProductName { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal LineTotal { get; init; }
}

// Endpoint tra cứu công khai (GET /order-requests/by-code/{code}), không xác thực - cố tình KHÔNG
// chứa tên/email/SĐT khách hàng (mã đơn có thể bị đoán/chia sẻ, tránh lộ PII).
public class OrderLookupDto
{
    public string OrderCode { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal TotalPrice { get; init; }
    public DateTime CreatedAt { get; init; }
    public List<OrderLookupItemDto> Items { get; init; } = new();
    public string BankName { get; init; } = string.Empty;
    public string BankAccountNumber { get; init; } = string.Empty;
    public string BankAccountHolder { get; init; } = string.Empty;
}
