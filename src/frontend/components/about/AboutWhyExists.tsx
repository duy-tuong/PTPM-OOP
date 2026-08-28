import { ScrollReveal } from "@/components/home/ScrollReveal";
import { NodeFlow } from "@/components/about/NodeFlow";
import { ABOUT_WHY } from "@/lib/constants/about";

export function AboutWhyExists() {
  return (
    <section className="border-y border-border/50 bg-muted/10 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <ScrollReveal direction="right" className="order-2 lg:order-1">
            <NodeFlow nodes={ABOUT_WHY.flow} />
          </ScrollReveal>

          <ScrollReveal direction="left" className="order-1 lg:order-2">
            <h2 className="font-heading text-3xl font-bold text-balance text-foreground sm:text-4xl">
              {ABOUT_WHY.heading}
            </h2>
            <div className="mt-6 flex max-w-prose flex-col gap-4">
              {ABOUT_WHY.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-lg leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
