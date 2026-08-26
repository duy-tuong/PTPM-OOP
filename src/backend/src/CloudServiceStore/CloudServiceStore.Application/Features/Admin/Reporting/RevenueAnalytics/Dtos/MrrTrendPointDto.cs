namespace CloudServiceStore.Application.Features.Admin.Reporting.RevenueAnalytics.Dtos;

// 1 điểm trên biểu đồ xu hướng - "New MRR bookings" theo từng tháng (đơn giản hoá: tổng MRR quy đổi
// của các đơn MUA MỚI hoàn tất trong tháng đó, KHÔNG phải MRR đang sống dựng lại theo từng ngày trong
// quá khứ - xem RevenueAnalyticsService.GetTrendAsync).
public class MrrTrendPointDto
{
    public string Month { get; init; } = string.Empty; // "yyyy-MM"
    public decimal NewMrrBookings { get; init; }
}
