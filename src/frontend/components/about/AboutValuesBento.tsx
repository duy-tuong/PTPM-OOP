import { SpotlightCard } from "@/components/home/SpotlightCard";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { getAboutIcon } from "@/lib/constants/aboutIcons";
import { ABOUT_CORE_VALUES } from "@/lib/constants/about";

// Bento 6 giá trị cốt lõi, nội dung tĩnh 100% (ABOUT_CORE_VALUES). Spotlight hover (tilt nhẹ theo con
// trỏ) tái dùng nguyên SpotlightCard đã có, tự tắt trên mobile theo đúng hành vi component gốc.
export function AboutValuesBento() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ScrollReveal className="mb-4 text-center">
        <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl">{ABOUT_CORE_VALUES.heading}</h2>
      </ScrollReveal>
      <ScrollReveal className="mx-auto mb-10 max-w-xl text-center text-muted-foreground" delay={0.05}>
        <p>{ABOUT_CORE_VALUES.subheading}</p>
      </ScrollReveal>

      <div className="group/bento grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ABOUT_CORE_VALUES.values.map((value, index) => {
          const Icon = getAboutIcon(value.iconKey);
          return (
            <ScrollReveal key={value.title} delay={(index % 3) * 0.08}>
              <SpotlightCard className="glass-card h-full rounded-3xl transition-opacity duration-500 group-hover/bento:opacity-50 hover:!opacity-100">
                <div className="group/card flex h-full flex-col justify-between p-6">
                  <div className="w-fit rounded-lg border border-border bg-foreground/5 p-3 transition-all duration-300 group-hover/card:-translate-y-0.5 group-hover/card:bg-primary/10">
                    <Icon className="size-7 text-primary" weight="fill" />
                  </div>
                  <div className="mt-6">
                    <h3 className="font-heading mb-2 text-lg">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              </SpotlightCard>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
