import Link from "next/link";
import { Lightning } from "@phosphor-icons/react/dist/ssr";
import { getPromotions } from "@/lib/api/catalog";
import { safeFetch } from "@/lib/api/safe";
import { CountdownBadge } from "@/components/home/CountdownBadge";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { Button } from "@/components/ui/button";

export async function PromotionBannerSection() {
  const promotions = await safeFetch(() => getPromotions({ revalidate: 300 }), []);

  if (promotions.length === 0) {
    return null;
  }

  const activePromotion = promotions[0];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <ScrollReveal>
        <div className="gradient-card relative overflow-hidden rounded-[20px] p-6 shadow-sm md:px-10 md:py-8">

          <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-between">
            <ScrollReveal direction="left" delay={0.1} className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
              <span className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-primary uppercase">
                <Lightning className="size-4" weight="fill" />
                Ưu đãi có hạn
              </span>
              <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
                {activePromotion.name}
              </h2>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.1} className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
              <CountdownBadge targetIso={activePromotion.endDate} />
              <Button
                size="lg"
                nativeButton={false}
                className="h-12 rounded-xl bg-primary px-8 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-hover hover:shadow-md"
                render={<Link href={`/gio-hang?promotionCode=${activePromotion.code}`}>Đặt dịch vụ</Link>}
              />
            </ScrollReveal>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
