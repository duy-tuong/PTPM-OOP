import { ScrollReveal } from "@/components/home/ScrollReveal";
import { ABOUT_PEOPLE } from "@/lib/constants/about";

// "Con người đứng sau công nghệ" - không hiển thị danh sách thành viên (chưa có nội dung chính thức,
// KHÔNG bịa). Visual minh hoạ: 1 silhouette trừu tượng nối với các node xung quanh, dựng thuần SVG tĩnh
// (không phải ảnh thật, không phải danh sách nhân sự).
export function AboutPeople() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <ScrollReveal direction="left">
          <h2 className="font-heading text-3xl font-bold text-balance text-foreground sm:text-4xl">
            {ABOUT_PEOPLE.heading[0]}
            <br />
            {ABOUT_PEOPLE.heading[1]}
          </h2>
          <div className="mt-6 flex max-w-prose flex-col gap-4">
            {ABOUT_PEOPLE.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-lg leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right">
          <div className="mx-auto aspect-square w-full max-w-xs" aria-hidden>
            <svg viewBox="0 0 200 200" className="h-full w-full">
              <circle cx="100" cy="100" r="90" fill="var(--primary)" fillOpacity="0.06" />
              <path
                d="M100 60a22 22 0 1 1 0 44 22 22 0 0 1 0-44Zm0 54c28 0 50 16 50 36v10H50v-10c0-20 22-36 50-36Z"
                fill="var(--primary)"
                fillOpacity="0.75"
              />
              {[
                [40, 50],
                [165, 60],
                [30, 150],
                [170, 150],
              ].map(([x, y]) => (
                <g key={`${x}-${y}`}>
                  <line x1="100" y1="100" x2={x} y2={y} stroke="var(--primary)" strokeOpacity="0.25" strokeWidth="1.5" />
                  <circle cx={x} cy={y} r="5" fill="var(--primary)" fillOpacity="0.6" />
                </g>
              ))}
            </svg>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
