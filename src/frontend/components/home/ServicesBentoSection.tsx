import Link from "next/link";
import type { ComponentType } from "react";
import { Cpu, HardDrives, At, EnvelopeSimple, LockKey, ShieldCheck, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getServiceCategories } from "@/lib/api/catalog";
import { safeFetch } from "@/lib/api/safe";
import { Reveal } from "@/components/shared/Reveal";

// Section 3/9 của Trang chủ (pivot 2 - theme "Cloudverse"). Thay 4 ô "Cloud Compute/Quantum
// Storage/Global Edge/Cyber Security" giả (sản phẩm hư cấu) bằng 6 ServiceCategory thật của hệ thống.
const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string; weight?: "fill" }>> = {
  vps: Cpu,
  hosting: HardDrives,
  domain: At,
  "email-doanh-nghiep": EnvelopeSimple,
  ssl: LockKey,
  "firewall-chong-ddos": ShieldCheck,
};

export async function ServicesBentoSection() {
  const categories = await safeFetch(() => getServiceCategories({ revalidate: 3600 }), []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <Reveal className="mb-16 flex flex-col gap-4 text-center">
        <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl">Danh Mục Dịch Vụ</h2>
        <p className="mx-auto max-w-[600px] text-lg text-muted-foreground">
          Hệ sinh thái hạ tầng đám mây toàn diện cho mọi nhu cầu doanh nghiệp.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => {
          const Icon = CATEGORY_ICONS[category.slug] ?? Cpu;
          return (
            <Reveal key={category.id} delay={index * 0.08}>
              <Link
                href={`/dich-vu/${category.slug}`}
                className="glass-card group flex h-full flex-col rounded-xl p-8 transition-all duration-500 hover:border-primary/30"
              >
                <div className="mb-6 w-fit rounded-lg border border-white/10 bg-white/5 p-3 transition-colors group-hover:bg-primary/10">
                  <Icon className="size-7 text-primary" weight="fill" />
                </div>
                <h3 className="font-heading mb-3 text-xl">{category.name}</h3>
                <p className="mb-6 flex-1 text-sm text-muted-foreground">{category.description}</p>
                <span className="group/link flex items-center gap-2 font-medium text-primary">
                  Tìm hiểu thêm
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
