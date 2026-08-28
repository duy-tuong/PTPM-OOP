import { ScrollReveal } from "@/components/home/ScrollReveal";
import { NodeFlow } from "@/components/about/NodeFlow";
import { ABOUT_FUTURE } from "@/lib/constants/about";

export function AboutFutureDirection() {
  return (
    <section className="border-y border-border/50 bg-muted/10 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <ScrollReveal direction="left">
            <h2 className="font-heading text-3xl font-bold text-balance text-foreground sm:text-4xl">
              {ABOUT_FUTURE.heading[0]}
              <br />
              {ABOUT_FUTURE.heading[1]}
            </h2>
            <div className="mt-6 flex max-w-prose flex-col gap-4">
              {ABOUT_FUTURE.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-lg leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <NodeFlow nodes={ABOUT_FUTURE.flow} />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
