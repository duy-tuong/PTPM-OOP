import Link from "next/link";

// Mirror kỹ thuật dot-grid + mask-image đã dùng ở AboutHero.tsx (cùng họ "trang thông tin" với
// /gioi-thieu, giữ nhất quán thị giác). Không có ContentPage nào seed cho slug "doi-tac" (khác About)
// nên đoạn giới thiệu là copy tĩnh, không lấy từ CMS.
export function PartnerHero() {
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

        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Trở thành Đối tác</h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Cùng Cloudverse mở rộng hệ sinh thái hạ tầng Cloud - giới thiệu khách hàng, nhận hoa hồng cho
          mỗi đơn hàng thành công.
        </p>
      </div>
    </section>
  );
}
