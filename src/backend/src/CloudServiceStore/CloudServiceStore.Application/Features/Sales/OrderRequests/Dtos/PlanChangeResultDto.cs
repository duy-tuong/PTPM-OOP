namespace CloudServiceStore.Application.Features.Sales.OrderRequests.Dtos;

public class PlanChangeResultDto
{
    // true: đã tạo 1 OrderRequest phụ (Source="plan-change") - client điều hướng sang
    // /thanh-toan/{OrderCode} như luồng thanh toán thường. false: đã đổi gói NGAY LẬP TỨC (hạ cấp/ngang
    // giá), không có gì để thanh toán thêm.
    public bool RequiresPayment { get; init; }
    public string? OrderCode { get; init; }
    public decimal AmountDue { get; init; }
}
