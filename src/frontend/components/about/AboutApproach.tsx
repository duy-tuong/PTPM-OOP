import { ScrollReveal } from "@/components/home/ScrollReveal";
import { ABOUT_APPROACH } from "@/lib/constants/about";

// Mirror ServiceProcessSteps.tsx (4 bước, numbered card) - stagger delay tăng dần theo thứ tự đã tạo
// cảm giác "node 01 sáng trước, rồi tới 02, 03, 04" khi cuộn tới mà không cần theo dõi scroll-progress
// riêng cho từng node (giữ animation nhẹ, đúng nguyên tắc "ưu tiên IntersectionObserver hơn scroll listener").
export function AboutApproach() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <ScrollReveal className="mb-12 text-center">
        <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl">{ABOUT_APPROACH.heading}</h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ABOUT_APPROACH.steps.map((step, index) => (
          <ScrollReveal key={step.title} delay={index * 0.12}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6">
              <span className="font-heading text-3xl font-bold text-primary/40">0{index + 1}</span>
              <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
