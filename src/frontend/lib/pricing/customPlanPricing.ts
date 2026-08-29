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

export interface CustomPlanConfigBounds {
  minVcpu?: number | null;
  maxVcpu?: number | null;
  stepVcpu?: number | null;
  minRamMb?: number | null;
  maxRamMb?: number | null;
  stepRamMb?: number | null;
  minDiskGb?: number | null;
  maxDiskGb?: number | null;
  stepDiskGb?: number | null;
}

function clampToStep(value: number | undefined, min: number, max: number, step: number): number {
  if (value == null || !Number.isFinite(value)) return min;
  const clamped = Math.min(max, Math.max(min, value));
  const snapped = min + Math.round((clamped - min) / step) * step;
  return Math.min(max, Math.max(min, snapped));
}

// Đợt 10, Phần 3 - dùng để khôi phục/validate cấu hình vCPU/RAM/Disk 1 khách đã chọn (vd từ query string
// của CTA "Triển Khai Ngay") trước khi thêm vào giỏ hàng. Trả `null` nếu plan chưa cấu hình đầy đủ
// Min/Max/Step (mirror guard đã có ở CustomPlanSliderConfigurator.tsx). Mỗi trục: có `override` hợp lệ
// thì clamp vào [min,max] rồi snap về bội số gần nhất của step tính từ min; không có/không hợp lệ thì
// fallback về min (đúng hành vi mặc định hiện tại khi khách chưa tự chọn gì).
export function resolveCustomPlanSelection(
  plan: CustomPlanConfigBounds,
  override?: { vcpu?: number; ramMb?: number; diskGb?: number },
): { vcpu: number; ramMb: number; diskGb: number } | null {
  if (
    plan.minVcpu == null || plan.maxVcpu == null || plan.stepVcpu == null ||
    plan.minRamMb == null || plan.maxRamMb == null || plan.stepRamMb == null ||
    plan.minDiskGb == null || plan.maxDiskGb == null || plan.stepDiskGb == null
  ) {
    return null;
  }

  return {
    vcpu: clampToStep(override?.vcpu, plan.minVcpu, plan.maxVcpu, plan.stepVcpu),
    ramMb: clampToStep(override?.ramMb, plan.minRamMb, plan.maxRamMb, plan.stepRamMb),
    diskGb: clampToStep(override?.diskGb, plan.minDiskGb, plan.maxDiskGb, plan.stepDiskGb),
  };
}
