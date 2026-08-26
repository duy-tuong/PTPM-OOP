using CloudServiceStore.Domain.Entities.Catalog;

namespace CloudServiceStore.Application.Common.Utils;

// Công thức tính giá gói Custom (ServicePlan.PackageType = Custom) - CHỈ 1 nguồn duy nhất, dùng chung
// cho cả tính giá bán thật (OrderRequestService.BuildServicePlanItemAsync) và hiển thị "giá từ"
// (ServicePlanService.MapToListItemDto) - tránh 2 nơi tính khác công thức dẫn tới hiển thị 1 giá
// nhưng lúc mua tính giá khác.
public static class CustomPlanPricing
{
    public static decimal ComputeUnitPrice(ServicePlan plan, int vcpu, int ramMb, int diskGb, int periodMonths, decimal? discountPercent)
    {
        var monthlyBase = vcpu * (plan.PricePerVcpuPerMonth ?? 0m)
            + (ramMb / 1024m) * (plan.PricePerRamGbPerMonth ?? 0m)
            + diskGb * (plan.PricePerDiskGbPerMonth ?? 0m);

        // Làm tròn VND (không thập phân) - phép nhân/phần trăm dễ sinh số lẻ, xem PDF "Rounding rule".
        return Math.Round(monthlyBase * periodMonths * (1 - (discountPercent ?? 0m) / 100m), 0, MidpointRounding.AwayFromZero);
    }
}
