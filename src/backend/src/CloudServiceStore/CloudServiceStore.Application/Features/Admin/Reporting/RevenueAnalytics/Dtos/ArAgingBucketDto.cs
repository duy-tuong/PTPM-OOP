namespace CloudServiceStore.Application.Features.Admin.Reporting.RevenueAnalytics.Dtos;

// Diễn giải lại "Accounts Receivable Aging" cho hệ thống trả trước 100% (không có công nợ trả sau
// thật): nhóm OrderRequest CHƯA thanh toán (Status trước Paid) theo tuổi kể từ CreatedAt - thể hiện
// "doanh thu đang treo chờ thanh toán" thay vì công nợ trả sau thật.
public class ArAgingBucketDto
{
    public string BucketLabel { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public int OrderCount { get; init; }
}
