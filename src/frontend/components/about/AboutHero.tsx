import Link from "next/link";

// Bám sát ServiceCategoryHero.tsx (dot-grid trung tính var(--foreground), không phải điểm nhấn màu).
// Thêm mask-image (linear-gradient) lên chính lớp overlay dot-grid để pattern mờ dần - mask chỉ chỉnh
// opacity của lớp pattern, KHÔNG phải màu nền section (vẫn bg-background phẳng) nên không vi phạm quy
// tắc "không dùng gradient màu nền" đã khoá cho design system.
export function AboutHero({ description }: { description?: string | null }) {
  return (
    <section className="relative overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-5 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        style={{
          backgroundImage: "radial-gradient(var(--foreground) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8 lg:py-12">

        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Giới thiệu</h1>

        {description && (
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{description}</p>
        )}
      </div>
    </section>
  );
}
