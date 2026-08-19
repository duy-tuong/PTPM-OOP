import Link from "next/link";
import type { ComponentType } from "react";
import { Cpu, HardDrives, At, EnvelopeSimple, LockKey, ShieldCheck, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getServiceCategories } from "@/lib/api/catalog";
import { safeFetch } from "@/lib/api/safe";
import { Reveal } from "@/components/shared/Reveal";
import { SpotlightCard } from "@/components/home/SpotlightCard";
import { cn } from "@/lib/utils";

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

// Bento 9-ô: VPS (hero, 2x2) + 5 danh mục còn lại đều 1x1. Thứ tự API trả về đúng DisplayOrder
// (VPS, Hosting, Domain, Email, SSL, Firewall) nên chỉ cần set span cho VPS - CSS Grid auto-placement
// (row-major, không cần "dense") tự xếp đúng vị trí 5 ô còn lại (Hosting/Domain xếp chồng cột 3 hàng
// 1-2, Email/SSL/Firewall xếp hàng 3) mà không cần hardcode className theo từng slug.
const HERO_SLUG = "vps";

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

      {/* group/bento: phạm vi hiệu ứng "peer dimming" - hover 1 thẻ làm mờ các thẻ còn lại. Tách biệt
          với group/card (đặt trên từng <Link>) - phạm vi micro-interaction riêng của từng thẻ (icon
          nhích lên, chữ/mũi tên đổi màu) để không bị lan sang thẻ khác khi chỉ hover 1 thẻ. */}
      <div className="group/bento grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[220px]">
        {categories.map((category, index) => {
          const Icon = CATEGORY_ICONS[category.slug] ?? Cpu;
          const isHero = category.slug === HERO_SLUG;

          return (
            <Reveal key={category.id} delay={index * 0.08} className={isHero ? "md:col-span-2 md:row-span-2" : undefined}>
              <SpotlightCard className="glass-card h-full rounded-3xl transition-opacity duration-500 group-hover/bento:opacity-50 hover:!opacity-100">
                <Link
                  href={`/dich-vu/${category.slug}`}
                  className={cn(
                    "group/card relative flex h-full flex-col justify-between overflow-hidden rounded-3xl",
                    isHero ? "p-10" : "p-6",
                  )}
                >
                  {isHero && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute right-0 bottom-0 size-48 opacity-40 [mask-image:radial-gradient(circle_at_bottom_right,black,transparent_70%)]"
                      style={{
                        backgroundImage:
                          "radial-gradient(color-mix(in oklch, var(--primary) 60%, transparent) 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                      }}
                    />
                  )}

                  <div
                    className={cn(
                      "relative w-fit rounded-lg border border-white/10 bg-white/5 transition-all duration-300 group-hover/card:-translate-y-0.5 group-hover/card:bg-primary/10",
                      isHero ? "p-4" : "p-3",
                    )}
                  >
                    <Icon className={isHero ? "size-9 text-primary" : "size-7 text-primary"} weight="fill" />
                  </div>

                  <div className="relative mt-6">
                    <h3 className={cn("font-heading mb-2", isHero ? "text-2xl" : "text-lg")}>{category.name}</h3>
                    <p className={cn("mb-6 text-muted-foreground", isHero ? "text-base" : "text-sm line-clamp-2")}>
                      {category.description}
                    </p>
                    <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover/card:text-primary">
                      Tìm hiểu thêm
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover/card:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </SpotlightCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
