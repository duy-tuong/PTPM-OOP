import Link from "next/link";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 mb-12">
      <ScrollReveal>
        {/* Nền lấy từ .cta-gradient (globals.css) - trộn primary/accent-purple/accent-cyan với đen qua
            color-mix(), luôn đủ tối để chữ trắng/slate-* cố định bên dưới giữ đúng tương phản ở cả 2
            theme, thay vì hardcode 1 hex (#0F172A) không liên quan gì tới theme như trước. */}
        <div className="cta-gradient relative mx-auto max-w-6xl overflow-hidden rounded-[32px] px-6 py-20 text-center shadow-2xl">
          {/* Ánh sáng chéo nhẹ thêm chiều sâu */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"
          />

          <div className="relative z-10 mx-auto max-w-3xl flex flex-col items-center gap-6">
            <h2 className="font-heading text-4xl font-extrabold text-white sm:text-5xl md:text-6xl text-balance leading-tight">
              Bạn đã sẵn sàng mở rộng <br className="hidden sm:block" /> hạ tầng của mình?
            </h2>
            <p className="text-lg text-slate-300 sm:text-xl">
              Để Cloudverse đồng hành cùng bạn.
            </p>

            <div className="mt-6 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
              <Button
                nativeButton={false}
                className="w-full h-14 rounded-xl bg-primary px-10 text-lg font-bold text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl sm:w-auto"
                render={<Link href="/lien-he">Đặt dịch vụ</Link>}
              />
              <Button
                variant="outline"
                nativeButton={false}
                className="w-full h-14 rounded-xl border-slate-600 bg-transparent px-10 text-lg font-bold text-white transition-all hover:bg-slate-800 hover:border-slate-400 sm:w-auto"
                render={<Link href="/lien-he?intent=tu-van">Tư vấn miễn phí</Link>}
              />
            </div>

            <Link
              href="/doi-tac"
              className="mt-6 text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              Trở thành đối tác tiếp thị liên kết →
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
