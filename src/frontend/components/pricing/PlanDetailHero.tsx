import Link from "next/link";
import type { ServicePlanDetailDto } from "@/lib/types/catalog";

// Mirror ServiceCategoryHero.tsx (dot-grid trung tính var(--foreground)) - breadcrumb mở rộng thêm 1
// cấp so với bản gốc (Trang chủ / Bảng giá / {category} / {plan}) vì đây là trang con của /bang-gia.
export function PlanDetailHero({ plan }: { plan: ServicePlanDetailDto }) {
  return (
    <section className="relative overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(var(--foreground) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Trang chủ
          </Link>
          {" / "}
          <Link href="/bang-gia" className="hover:text-foreground">
            Bảng giá
          </Link>
          {" / "}
          <span className="text-foreground">{plan.categoryName}</span>
          {" / "}
          <span className="text-foreground">{plan.name}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium tracking-widest text-primary uppercase">{plan.categoryName}</span>
          {plan.regionName && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              📍 {plan.regionName}
            </span>
          )}
        </div>
        <h1 className="mt-2 font-heading text-4xl font-bold text-foreground sm:text-5xl">{plan.name}</h1>

        {(plan.description ?? plan.shortDescription) && (
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{plan.description ?? plan.shortDescription}</p>
        )}
      </div>
    </section>
  );
}
