import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { aggregateHighlightedFeatures } from "@/lib/utils/planFeatures";
import { cn, formatCurrency } from "@/lib/utils";
import type { ServiceCategoryDto, ServicePlanListItemDto } from "@/lib/types/catalog";

const PACKAGE_TYPE_LABELS: Record<string, string> = {
  Fixed: "Cố định",
  Custom: "Tuỳ chỉnh",
};

interface ComparisonRow {
  categorySlug: string;
  categoryName: string;
  packageTypeLabel: string;
  startingPriceLabel: string;
  planCount: number | null;
  highlightedFeatureCount: number | null;
}

// "So sánh / tìm giải pháp" - KHÔNG có entity so sánh (use-case/scalability/control) trong backend nên
// đây KHÔNG phải bảng biên tập tay kiểu PDF, mà là bảng TỔNG HỢP dữ liệu thật đã fetch sẵn: giá khởi
// điểm/số gói/số tính năng nổi bật theo từng danh mục - giúp khách nhìn nhanh sự khác biệt mà không cần
// vào từng trang con. Domain là trường hợp đặc biệt (không có ServicePlan, giá nằm ở TldPricing riêng)
// nên chỉ thêm 1 hàng trỏ sang bảng giá tên miền, không có số liệu plan.
export function ServiceComparisonTable({
  categories,
  plans,
  hasDomainPricing,
}: {
  categories: ServiceCategoryDto[];
  plans: ServicePlanListItemDto[];
  hasDomainPricing: boolean;
}) {
  const plansByCategory = new Map<string, ServicePlanListItemDto[]>();
  plans.forEach((plan) => {
    const list = plansByCategory.get(plan.categorySlug) ?? [];
    list.push(plan);
    plansByCategory.set(plan.categorySlug, list);
  });

  const rows: ComparisonRow[] = [];
  [...categories]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .forEach((category) => {
      const group = plansByCategory.get(category.slug) ?? [];

      if (group.length > 0) {
        const packageTypeLabel = [...new Set(group.map((p) => p.packageType))]
          .map((type) => PACKAGE_TYPE_LABELS[type] ?? type)
          .join(" & ");
        const minPrice = Math.min(...group.map((p) => p.startingPrice ?? Infinity));

        rows.push({
          categorySlug: category.slug,
          categoryName: category.name,
          packageTypeLabel,
          startingPriceLabel: Number.isFinite(minPrice) ? `Từ ${formatCurrency(minPrice)}/tháng` : "Liên hệ",
          planCount: group.length,
          highlightedFeatureCount: aggregateHighlightedFeatures(group, Infinity).length,
        });
      } else if (hasDomainPricing && category.slug === "domain") {
        rows.push({
          categorySlug: category.slug,
          categoryName: category.name,
          packageTypeLabel: "—",
          startingPriceLabel: "Xem bảng giá tên miền",
          planCount: null,
          highlightedFeatureCount: null,
        });
      }
    });

  if (rows.length < 2) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal className="mb-10 flex flex-col gap-3 text-center">
        <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Không biết nên chọn dịch vụ nào?</h2>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground">
          So sánh nhanh quy mô và mức giá khởi điểm giữa các danh mục dịch vụ.
        </p>
      </ScrollReveal>

      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Danh mục</TableHead>
              <TableHead>Loại gói</TableHead>
              <TableHead>Giá khởi điểm</TableHead>
              <TableHead className="text-center">Số gói</TableHead>
              <TableHead className="text-center">Tính năng nổi bật</TableHead>
              <TableHead className="text-right">&nbsp;</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.categorySlug}>
                <TableCell className="font-medium text-foreground">{row.categoryName}</TableCell>
                <TableCell className="text-muted-foreground">{row.packageTypeLabel}</TableCell>
                <TableCell className="text-foreground">{row.startingPriceLabel}</TableCell>
                <TableCell className={cn("text-center text-muted-foreground", row.planCount === null && "text-muted-foreground/50")}>
                  {row.planCount ?? "—"}
                </TableCell>
                <TableCell className={cn("text-center text-muted-foreground", row.highlightedFeatureCount === null && "text-muted-foreground/50")}>
                  {row.highlightedFeatureCount ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/dich-vu/${row.categorySlug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Xem chi tiết
                    <ArrowRight className="size-3.5" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
