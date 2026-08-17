import { Quotes, Star } from "@phosphor-icons/react/dist/ssr";
import { getTestimonials } from "@/lib/api/content";
import { safeFetch } from "@/lib/api/safe";
import { FallbackImage } from "@/components/shared/FallbackImage";
import { Reveal } from "@/components/shared/Reveal";
import type { TestimonialDto } from "@/lib/types/content";

// Section 6/9 của Trang chủ (pivot 2 - theme "Cloudverse"). Thay 4 testimonial giả (Alex Nguyen/CTO
// AuraCorp...) của bản Stitch gốc bằng getTestimonials() thật. Số cột co giãn theo số lượng thật -
// không ép đủ 3-4 cột khi DB có ít testimonial.
export async function TestimonialsGridSection() {
  const testimonials = await safeFetch(() => getTestimonials({ revalidate: 3600 }), []);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <Reveal className="mb-16 flex flex-col gap-4 text-center">
        <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl">Lòng Tin Từ Cộng Đồng</h2>
        <p className="mx-auto max-w-[600px] text-lg text-muted-foreground">
          Lắng nghe chia sẻ từ những khách hàng đang xây dựng hạ tầng cùng Cloudverse.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Reveal key={testimonial.id} delay={index * 0.1}>
            <TestimonialCard testimonial={testimonial} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialDto }) {
  return (
    <div className="glass-card group relative flex h-full flex-col overflow-hidden rounded-xl p-8">
      <Quotes className="pointer-events-none absolute -top-4 -right-4 size-24 text-primary opacity-5" weight="fill" />

      {testimonial.rating != null && (
        <div className="mb-4 flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className="size-4 text-primary"
              weight={i < Math.round(testimonial.rating!) ? "fill" : "regular"}
            />
          ))}
        </div>
      )}

      <p className="relative z-10 mb-8 flex-1 text-sm text-muted-foreground italic">&ldquo;{testimonial.content}&rdquo;</p>

      <div className="flex items-center gap-4">
        <div className="size-12 shrink-0 overflow-hidden rounded-full border border-primary/20 bg-primary/10">
          <FallbackImage
            src={testimonial.avatarUrl}
            alt={testimonial.displayName}
            className="h-full w-full object-cover"
            fallbackClassName="flex h-full w-full items-center justify-center text-sm font-medium text-primary"
          />
        </div>
        <div>
          <h4 className="text-sm font-semibold">{testimonial.displayName}</h4>
          {testimonial.companyName && (
            <p className="text-xs text-muted-foreground/70">{testimonial.companyName}</p>
          )}
        </div>
      </div>
    </div>
  );
}
