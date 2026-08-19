import { Quotes, Star } from "@phosphor-icons/react/dist/ssr";
import { getTestimonials } from "@/lib/api/content";
import { safeFetch } from "@/lib/api/safe";
import { FallbackImage } from "@/components/shared/FallbackImage";
import { Marquee } from "@/components/shared/Marquee";
import { Reveal } from "@/components/shared/Reveal";
import type { TestimonialDto } from "@/lib/types/content";

// Section 6/9 của Trang chủ - phong cách "Minimalist SaaS" (tuyệt đối không gradient): băng chuyền
// cuộn ngang vô hạn (Marquee dùng chung, đã có sẵn mask-fade 2 mép), pause khi hover, thẻ nền solid
// tối trung tính (khác .glass-card cyan-tinted dùng ở các section khác - chủ đích tương phản, không
// phải lỗi thiếu nhất quán). Dữ liệu thật từ getTestimonials(), không bịa.
export async function TestimonialsGridSection() {
  const testimonials = await safeFetch(() => getTestimonials({ revalidate: 3600 }), []);

  if (testimonials.length === 0) {
    return null;
  }

  const shouldMarquee = testimonials.length > 1;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-16 flex flex-col gap-4 text-center">
          <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl">Lòng Tin Từ Cộng Đồng</h2>
          <p className="mx-auto max-w-[600px] text-lg text-muted-foreground">
            Lắng nghe chia sẻ từ những khách hàng đang xây dựng hạ tầng cùng Cloudverse.
          </p>
        </Reveal>

        {shouldMarquee ? (
          <Marquee pauseOnHover gapClassName="gap-8 pr-8">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </Marquee>
        ) : (
          <div className="flex justify-center">
            <TestimonialCard testimonial={testimonials[0]} />
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialDto }) {
  return (
    <div className="group relative flex h-full w-[380px] shrink-0 flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80 p-8 transition-colors duration-300 hover:border-primary">
      <Quotes className="pointer-events-none absolute -top-4 -right-4 size-24 text-zinc-800" weight="fill" />

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
