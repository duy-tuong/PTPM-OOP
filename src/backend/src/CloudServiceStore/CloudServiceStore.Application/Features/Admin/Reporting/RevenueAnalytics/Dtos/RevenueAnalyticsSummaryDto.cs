namespace CloudServiceStore.Application.Features.Admin.Reporting.RevenueAnalytics.Dtos;

// Các chỉ số doanh thu định kỳ - quy đổi MRR/ARR theo mô hình "mua theo kỳ hạn cố định" (không phải
// subscription tính tiền hàng tháng thật): mỗi OrderRequestItem đang sống (ExpiresAt > now) đóng góp
// UnitPrice/PeriodMonths vào MRR. Xem RevenueAnalyticsService cho công thức đầy đủ.
public class RevenueAnalyticsSummaryDto
{
    public decimal Mrr { get; init; }
    public decimal Arr { get; init; }

    // Net New MRR tháng hiện tại = NewMrr - ChurnedMrr. KHÔNG tách Expansion/Contraction MRR (nâng/hạ
    // cấp) vì hạ cấp áp dụng ngay không tạo OrderRequest (xem PlanChangeService) - không còn snapshot
    // giá cũ để tính chênh lệch chính xác; đây là đơn giản hoá có chủ đích, không bịa số.
    public decimal NewMrr { get; init; }
    public decimal ChurnedMrr { get; init; }
    public decimal NetNewMrr { get; init; }

    public decimal Arpu { get; init; }
    public decimal ChurnRatePercent { get; init; }

    // Trung bình tổng doanh thu (OrderRequest.TotalPrice, Status=Completed) theo từng khách hàng - chọn
    // công thức "trung bình doanh thu trọn đời thực tế" thay vì ARPU/ChurnRate (công thức SaaS chuẩn dễ
    // vỡ số khi ChurnRate≈0).
    public decimal Ltv { get; init; }
}