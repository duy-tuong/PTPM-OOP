import { ScrollReveal } from "@/components/home/ScrollReveal";
import { ABOUT_MISSION, ABOUT_VISION } from "@/lib/constants/about";

// Sứ mệnh + Tầm nhìn nằm chung 1 section, 2 cột (thay vì 2 section riêng xếp chồng) - glow toả tâm phía
// sau dùng chung cho cả 2 cột, có vạch chia dọc ở desktop để tách bạch 2 phát biểu. 1 animation chính
// (ScrollReveal fade-up) cho mỗi cột.
export function AboutMissionVision() {
  return (
    <section className="relative overflow-hidden border-y border-border/50 bg-muted/10 py-14 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]"
      />

      <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-border/60 lg:px-8">
        <ScrollReveal direction="left" className="text-center lg:pr-12">
          <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">{ABOUT_MISSION.heading}</span>
          <p className="font-heading mt-5 text-2xl leading-snug font-bold text-balance text-foreground sm:text-3xl">
            {ABOUT_MISSION.statement}
          </p>
        </ScrollReveal>

        <ScrollReveal direction="right" className="text-center lg:pl-12">
          <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">{ABOUT_VISION.heading}</span>
          <p className="font-heading mt-5 text-2xl leading-snug font-bold text-balance text-foreground sm:text-3xl">
            {ABOUT_VISION.statement}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
