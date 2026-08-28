import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { getAboutIcon } from "@/lib/constants/aboutIcons";
import { ABOUT_ECOSYSTEM } from "@/lib/constants/about";

// Chỉ GIỚI THIỆU hệ sinh thái ở mức vừa phải - cố tình KHÔNG dùng card có border/shadow giống product
// card (dễ lẫn với trang Dịch vụ/Bảng giá), không giá, không nút "Mua ngay". Chỉ icon + tên + mô tả 1
// dòng, và đúng 1 link nhẹ dẫn sang trang Dịch vụ.
export function AboutEcosystem() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <ScrollReveal className="mb-4 text-center">
        <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl">
          {ABOUT_ECOSYSTEM.heading[0]}
          <br />
          {ABOUT_ECOSYSTEM.heading[1]}
        </h2>
      </ScrollReveal>
      <ScrollReveal className="mx-auto mb-12 max-w-xl text-center text-muted-foreground" delay={0.05}>
        <p>{ABOUT_ECOSYSTEM.description}</p>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {ABOUT_ECOSYSTEM.items.map((item) => {
            const Icon = getAboutIcon(item.iconKey);
            return (
              <div key={item.name} className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
                <Icon className="size-6 text-primary" weight="duotone" />
                <span className="text-sm font-semibold text-foreground">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </div>
            );
          })}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.15} className="mt-12 text-center">
        <Button
          variant="outline"
          className="gap-2 rounded-full"
          nativeButton={false}
          render={
            <Link href={ABOUT_ECOSYSTEM.ctaHref}>
              {ABOUT_ECOSYSTEM.ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
          }
        />
      </ScrollReveal>
    </section>
  );
}
