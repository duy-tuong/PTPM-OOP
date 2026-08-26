// Công thức tính giá gói Custom (packageType === "Custom") - CHỈ dùng để preview giá client-side
// TRƯỚC khi đặt hàng. Backend (CustomPlanPricing.ComputeUnitPrice) luôn tính lại giá thật lúc tạo đơn -
// không tin giá từ client, xem OrderRequestService.BuildServicePlanItemAsync.
export interface CustomPlanUnitPriceRates {
  pricePerVcpuPerMonth?: number | null;
  pricePerRamGbPerMonth?: number | null;
  pricePerDiskGbPerMonth?: number | null;
}

export function computeCustomPlanUnitPrice(
  plan: CustomPlanUnitPriceRates,
  vcpu: number,
  ramMb: number,
  diskGb: number,
  periodMonths: number,
  discountPercent?: number | null,
): number {
  const monthlyBase =
    vcpu * (plan.pricePerVcpuPerMonth ?? 0) +
    (ramMb / 1024) * (plan.pricePerRamGbPerMonth ?? 0) +
    diskGb * (plan.pricePerDiskGbPerMonth ?? 0);

  return Math.round(monthlyBase * periodMonths * (1 - (discountPercent ?? 0) / 100));
}
