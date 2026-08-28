import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { ABOUT_CLOSING } from "@/lib/constants/about";

// Lời kết - KHÔNG phải CTA bán hàng (không "Mua ngay"/"Đăng ký ngay"/pricing). Chỉ 1 link nhẹ mời tiếp
// tục khám phá website, có hiệu ứng magnetic (đặc biệt dành riêng cho CTA cuối cùng theo brief).
export function AboutClosing() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8 lg:py-20">
      <ScrollReveal>
        <h2 className="font-heading text-3xl font-bold text-balance text-foreground sm:text-4xl lg:text-5xl">
          {ABOUT_CLOSING.heading[0]}
          <br />
          {ABOUT_CLOSING.heading[1]}
        </h2>
        <div className="mx-auto mt-6 flex max-w-xl flex-col gap-4">
          {ABOUT_CLOSING.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-lg leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-10">
          <MagneticButton>
            <Button
              variant="outline"
              className="gap-2 rounded-full"
              nativeButton={false}
              render={
                <Link href={ABOUT_CLOSING.ctaHref}>
                  {ABOUT_CLOSING.ctaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              }
            />
          </MagneticButton>
        </div>
      </ScrollReveal>
    </section>
  );
}
