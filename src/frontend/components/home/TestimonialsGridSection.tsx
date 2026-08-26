import { Star } from "@phosphor-icons/react/dist/ssr";
import { getTestimonials } from "@/lib/api/content";
import { safeFetch } from "@/lib/api/safe";
import { FallbackImage } from "@/components/shared/FallbackImage";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import type { TestimonialDto } from "@/lib/types/content";

export async function TestimonialsGridSection() {
  const testimonials = await safeFetch(() => getTestimonials({ revalidate: 3600 }), []);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-border/50 bg-muted/10 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-12 flex flex-col gap-4 text-center">
          <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">Lòng tin từ cộng đồng</h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Hàng ngàn doanh nghiệp Việt Nam đang tin tưởng và xây dựng hạ tầng số cùng Cloudverse.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={testimonial.id} delay={index * 0.1}>
              <TestimonialCard testimonial={testimonial} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialDto }) {
  const rating = testimonial.rating ?? 5;

  return (
    <div className="group flex h-full flex-col justify-between rounded-[20px] border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-md">
      {/* Rating */}
      <div className="mb-6 flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className="size-4 text-amber-500" weight={i < rating ? "fill" : "regular"} />
        ))}
      </div>

      {/* Quote */}
      <p className="mb-6 flex-1 text-base font-medium leading-relaxed text-foreground">
        &ldquo;{testimonial.content}&rdquo;
      </p>

      {/* Author Info */}
      <div className="flex items-center gap-4 border-t border-border/50 pt-6">
        <FallbackImage
          src={testimonial.avatarUrl}
          alt={testimonial.displayName}
          className="size-12 shrink-0 rounded-full object-cover"
          fallbackClassName="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
        />
        <div>
          <h4 className="text-sm font-bold text-foreground">{testimonial.displayName}</h4>
          {testimonial.companyName && (
            <p className="text-xs font-medium text-muted-foreground mt-0.5">{testimonial.companyName}</p>
          )}
        </div>
      </div>
    </div>
  );
}
