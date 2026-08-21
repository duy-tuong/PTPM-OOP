"use client";

import { CustomerType, CUSTOMER_TYPE_LABELS } from "@/lib/types/enums";
import { cn } from "@/lib/utils";

const OPTIONS = [CustomerType.Individual, CustomerType.Business];

// Không có radio-group component dùng chung trong dự án - dựng bằng 2 nút bấm, cùng kiểu "pill" trắng-
// đen tự đảo theo theme (bg-foreground/text-background) đã dùng cho active state ở PillLink
// (NewsSplitScreen.tsx)/PricingMatrixTabs.tsx. Dùng chung ở OrderRequestForm/ConsultationRequestForm
// (lien-he) và ProfileForm (khach-hang).
export function CustomerTypeToggle({
  value,
  onChange,
}: {
  value: CustomerType;
  onChange: (value: CustomerType) => void;
}) {
  return (
    <div className="inline-flex w-fit rounded-lg border border-border p-1">
      {OPTIONS.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            value === type ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {CUSTOMER_TYPE_LABELS[CustomerType[type]]}
        </button>
      ))}
    </div>
  );
}
