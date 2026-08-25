"use client";

import { Star } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/home/ScrollReveal";

const MOCK_TESTIMONIALS = [
  {
    id: 1,
    rating: 5,
    content: "Dịch vụ VPS cực kỳ ổn định, quá trình triển khai siêu tốc và đội ngũ kỹ thuật hỗ trợ rất tận tâm. Từ ngày chuyển sang Cloudverse, nền tảng của chúng tôi chưa từng bị gián đoạn.",
    author: {
      name: "Nguyễn Văn A",
      role: "CEO — Công ty ABC",
      avatarInitials: "NA",
    }
  },
  {
    id: 2,
    rating: 5,
    content: "Hệ thống quản lý trực quan và hiệu năng phần cứng mạnh mẽ. Điểm tôi thích nhất là tính năng tự động sao lưu hằng ngày và hệ thống chống DDoS hoạt động rất hiệu quả.",
    author: {
      name: "Trần Thị B",
      role: "CTO — TechSolutions",
      avatarInitials: "TB",
    }
  },
  {
    id: 3,
    rating: 5,
    content: "Tốc độ băng thông và phản hồi mạng thật sự ấn tượng. Dịch vụ chăm sóc khách hàng 24/7 giúp team developer của chúng tôi yên tâm mở rộng quy mô bất cứ lúc nào.",
    author: {
      name: "Lê Hoàng C",
      role: "Lead DevOps — Startup X",
      avatarInitials: "LC",
    }
  }
];

export function TestimonialsGridSection() {
  return (
    <section className="border-y border-border/50 bg-muted/10 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-16 flex flex-col gap-4 text-center">
          <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">Lòng tin từ cộng đồng</h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Hàng ngàn doanh nghiệp Việt Nam đang tin tưởng và xây dựng hạ tầng số cùng Cloudverse.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {MOCK_TESTIMONIALS.map((testimonial, index) => (
            <ScrollReveal key={testimonial.id} delay={index * 0.1}>
              <div className="group flex h-full flex-col justify-between rounded-[20px] border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-md">
                
                {/* Rating */}
                <div className="mb-6 flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className="size-4 text-amber-500"
                      weight={i < testimonial.rating ? "fill" : "regular"}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="mb-8 flex-1 text-base font-medium leading-relaxed text-foreground sm:text-lg">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4 border-t border-border/50 pt-6">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                    {testimonial.author.avatarInitials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{testimonial.author.name}</h4>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">{testimonial.author.role}</p>
                  </div>
                </div>

              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
