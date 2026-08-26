import Link from "next/link";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 mb-12">
      <ScrollReveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-[#0F172A] px-6 py-20 text-center shadow-2xl">
          {/* Subtle B2B gradient overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-cyan-900/30"
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
                className="w-full h-14 rounded-xl bg-blue-600 px-10 text-lg font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl sm:w-auto"
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
