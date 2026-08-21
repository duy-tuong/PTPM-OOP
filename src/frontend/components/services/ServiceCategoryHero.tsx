import Link from "next/link";
import type { ServiceCategoryDto } from "@/lib/types/catalog";

// Section 1/4 của /dich-vu/[categorySlug] - "Định vị" bằng typography thay vì ảnh nền. Nền + lưới
// dot-grid tái dùng đúng kỹ thuật đã có ở ServicesBentoSection.tsx (radial-gradient 1px, backgroundSize
// 16px 16px) nhưng đổi tông sang var(--foreground) trung tính (thay var(--primary)) - Hero cần cảm giác
// "kỹ thuật/blueprint" trung tính, không phải điểm nhấn màu.
export function ServiceCategoryHero({ category }: { category: ServiceCategoryDto }) {
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
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Trang chủ
          </Link>
          {" / "}
          <Link href="/dich-vu" className="hover:text-foreground">
            Dịch vụ
          </Link>
          {" / "}
          <span className="text-foreground">{category.name}</span>
        </nav>

        <h1 className="font-heading text-5xl font-bold text-foreground sm:text-6xl lg:text-7xl">{category.name}</h1>

        {category.description && (
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{category.description}</p>
        )}
      </div>
    </section>
  );
}
