import type { Metadata } from "next";
import { getServiceCategories } from "@/lib/api/catalog";
import { safeFetch } from "@/lib/api/safe";
import { ServicesCommandCenter } from "@/components/services/ServicesCommandCenter";

export const metadata: Metadata = {
  title: "Dịch vụ",
  description:
    "Toàn bộ dịch vụ VPS, Hosting, Domain, Email doanh nghiệp, SSL và Firewall chống DDoS của Cloudverse.",
};

export default async function ServicesPage() {
  const categories = await safeFetch(() => getServiceCategories({ revalidate: 3600 }), []);
  const sorted = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">Dịch vụ của chúng tôi</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Hạ tầng cloud đầy đủ cho doanh nghiệp Việt - từ VPS đến bảo mật, tất cả trong 1 nền tảng.
        </p>
      </div>

      {sorted.length > 0 ? (
        <ServicesCommandCenter categories={sorted} />
      ) : (
        <p className="mx-auto max-w-7xl px-4 py-12 text-center text-muted-foreground sm:px-6 lg:px-8">
          Chưa có danh mục dịch vụ nào.
        </p>
      )}
    </>
  );
}
