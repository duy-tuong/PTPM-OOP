namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

public class OrderRequestDto
{
    public int Id { get; init; }
    public string OrderCode { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal TotalPrice { get; init; }
    public DateTime CreatedAt { get; init; }
}
