"use client";

import { computeCustomPlanUnitPrice } from "@/lib/pricing/customPlanPricing";
import { formatCurrency } from "@/lib/utils";
import type { ServicePlanCustomConfigFields } from "@/lib/types/catalog";

export interface CustomPlanSelection {
  vcpu: number;
  ramMb: number;
  diskGb: number;
}

interface CustomPlanSliderConfiguratorProps {
  plan: ServicePlanCustomConfigFields;
  selection: CustomPlanSelection;
  onChange: (next: CustomPlanSelection) => void;
  periodMonths: number;
  discountPercent?: number | null;
}

// Thanh trượt kéo cấu hình vCPU/RAM/Disk cho gói Custom (packageType === "Custom") - khác
// PlanConfiguratorSlider.tsx (slider chọn GIỮA CÁC GÓI CỐ ĐỊNH rời rạc theo giá). Giá hiển thị ở đây
// chỉ để PREVIEW - backend luôn tính lại từ chosenVcpu/RamMb/DiskGb lúc tạo đơn (xem
// CustomPlanPricing.ComputeUnitPrice ở backend, dùng ĐÚNG công thức này).
export function CustomPlanSliderConfigurator({
  plan,
  selection,
  onChange,
  periodMonths,
  discountPercent,
}: CustomPlanSliderConfiguratorProps) {
  if (
    plan.minVcpu == null || plan.maxVcpu == null || plan.stepVcpu == null ||
    plan.minRamMb == null || plan.maxRamMb == null || plan.stepRamMb == null ||
    plan.minDiskGb == null || plan.maxDiskGb == null || plan.stepDiskGb == null
  ) {
    return <p className="text-sm text-destructive">Gói này chưa được cấu hình đầy đủ thông số tuỳ biến.</p>;
  }

  const price = computeCustomPlanUnitPrice(plan, selection.vcpu, selection.ramMb, selection.diskGb, periodMonths, discountPercent);

  return (
    <div className="flex flex-col gap-5">
      <SliderRow
        label="vCPU"
        min={plan.minVcpu}
        max={plan.maxVcpu}
        step={plan.stepVcpu}
        value={selection.vcpu}
        formatValue={(v) => `${v} vCPU`}
        onChange={(v) => onChange({ ...selection, vcpu: v })}
      />
      <SliderRow
        label="RAM"
        min={plan.minRamMb}
        max={plan.maxRamMb}
        step={plan.stepRamMb}
        value={selection.ramMb}
        formatValue={(v) => `${(v / 1024).toFixed(v % 1024 === 0 ? 0 : 1)} GB`}
        onChange={(v) => onChange({ ...selection, ramMb: v })}
      />
      <SliderRow
        label="Ổ đĩa"
        min={plan.minDiskGb}
        max={plan.maxDiskGb}
        step={plan.stepDiskGb}
        value={selection.diskGb}
        formatValue={(v) => `${v} GB`}
        onChange={(v) => onChange({ ...selection, diskGb: v })}
      />

      <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
        <p className="text-xs text-muted-foreground">Giá ước tính cho {periodMonths} tháng</p>
        <p className="text-2xl font-bold text-primary">{formatCurrency(price)}</p>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  min,
  max,
  step,
  value,
  formatValue,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  formatValue: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-medium text-primary">{formatValue(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-input accent-primary"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
