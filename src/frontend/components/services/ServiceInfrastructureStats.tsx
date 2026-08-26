import { MapPinLine, HardDrives, SquaresFour, Package } from "@phosphor-icons/react/dist/ssr";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import type { RegionDto, ServicePlanListItemDto } from "@/lib/types/catalog";

// "Hạ tầng" - backend không có field metric kiểu uptime%/DDoS/backup/monitoring (đã xác nhận qua rà
// soát Domain) nên KHÔNG bịa số liệu editorial. Thay vào đó dùng COUNT THẬT đếm được từ chính dữ liệu
// đã fetch (số Region/OS/danh mục/gói đang có) - vẫn là số thật 100%, chỉ khác cách diễn giải so với
// brief gốc (uptime/DDoS...) vì dữ liệu đó không tồn tại trong hệ thống.
export function ServiceInfrastructureStats({
  regions,
  plans,
  totalPlanCount,
  categoryCount,
}: {
  regions: RegionDto[];
  plans: ServicePlanListItemDto[];
  totalPlanCount: number;
  categoryCount: number;
}) {
  const osImageCount = new Set(plans.flatMap((plan) => plan.osImages.map((os) => os.osImageId))).size;

  const stats = [
    { label: "Khu vực triển khai", value: regions.length, icon: MapPinLine },
    { label: "Hệ điều hành hỗ trợ", value: osImageCount, icon: HardDrives },
    { label: "Danh mục dịch vụ", value: categoryCount, icon: SquaresFour },
    { label: "Gói dịch vụ đang cung cấp", value: totalPlanCount, icon: Package },
  ].filter((stat) => stat.value > 0);

  if (stats.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-border/50 bg-muted/10 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-12 flex flex-col gap-3 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Hạ tầng Cloudverse hiện tại</h2>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4 sm:divide-x sm:divide-border/50">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col items-center gap-2 px-4 text-center">
                <Icon className="mb-1 size-6 text-primary" weight="fill" />
                <AnimatedNumber value={stat.value} className="text-3xl font-extrabold text-foreground sm:text-4xl" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
