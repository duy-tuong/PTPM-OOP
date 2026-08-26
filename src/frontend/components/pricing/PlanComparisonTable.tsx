import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { priceFor } from "@/components/pricing/PlanConfiguratorSlider";
import { formatCurrency } from "@/lib/utils";
import type { ServicePlanListItemDto } from "@/lib/types/catalog";

// Bảng so sánh nhiều plan cạnh nhau theo TỪNG FEATURE (hàng=feature, cột=plan) - khác hẳn
// ServiceComparisonTable.tsx (Đợt 4, so sánh theo DANH MỤC không phải theo PLAN). Hàng feature là UNION
// featureKey thật của các plan đang so sánh, theo đúng thứ tự xuất hiện đầu tiên (không sort alphabet -
// giữ nguyên thứ tự Admin đã sắp qua DisplayOrder ở ServicePlanForm.tsx). Ô không có feature ở 1 plan
// nào đó -> "—", không suy diễn "Không hỗ trợ" (có thể feature đó chỉ đơn giản chưa được Admin nhập).
export function PlanComparisonTable({ plans, period }: { plans: ServicePlanListItemDto[]; period: number }) {
  if (plans.length < 2) {
    return null;
  }

  const rows: { featureKey: string; featureLabel: string }[] = [];
  const seen = new Set<string>();
  plans.forEach((plan) => {
    plan.features.forEach((feature) => {
      if (!seen.has(feature.featureKey)) {
        seen.add(feature.featureKey);
        rows.push({ featureKey: feature.featureKey, featureLabel: feature.featureLabel });
      }
    });
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Tính năng</TableHead>
            {plans.map((plan) => (
              <TableHead key={plan.id} className="text-center">
                <Link href={`/bang-gia/${plan.slug}`} className="font-semibold text-foreground hover:text-primary">
                  {plan.name}
                </Link>
                {plan.isFeatured && (
                  <div className="mx-auto mt-1 w-fit rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold tracking-wide text-primary-foreground uppercase">
                    Phổ biến nhất
                  </div>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium text-foreground">Giá</TableCell>
            {plans.map((plan) => (
              <TableCell key={plan.id} className="text-center font-bold text-foreground">
                {formatCurrency(priceFor(plan, period))}
              </TableCell>
            ))}
          </TableRow>
          {rows.map((row) => (
            <TableRow key={row.featureKey}>
              <TableCell className="text-muted-foreground">{row.featureLabel}</TableCell>
              {plans.map((plan) => {
                const feature = plan.features.find((f) => f.featureKey === row.featureKey);
                return (
                  <TableCell key={plan.id} className="text-center">
                    {feature ? feature.featureValueText : <span className="text-muted-foreground/40">—</span>}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
