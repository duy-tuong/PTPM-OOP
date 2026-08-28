import { ScrollReveal } from "@/components/home/ScrollReveal";
import { getAboutIcon } from "@/lib/constants/aboutIcons";
import { ABOUT_AUDIENCE } from "@/lib/constants/about";

export function AboutAudience() {
  return (
    <section className="border-y border-border/50 bg-muted/10 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl">{ABOUT_AUDIENCE.heading}</h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {ABOUT_AUDIENCE.groups.map((group, index) => {
            const Icon = getAboutIcon(group.iconKey);
            return (
              <ScrollReveal key={group.title} delay={index * 0.1}>
                <div className="flex h-full flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="size-7 text-primary" weight="fill" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{group.title}</h3>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
