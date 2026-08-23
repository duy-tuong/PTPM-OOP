import type { ReactNode } from "react";
import { Logo } from "@/components/shared/Logo";
import { ParallaxLayer } from "@/components/shared/ParallaxLayer";

// Khung dùng chung cho /login + /register (Server Component) - tái dùng nguyên vẹn ngôn ngữ thị giác
// đã thiết lập ở Hero: 2 blob nền cyan/tím trôi chậm qua ParallaxLayer, .glass-card làm khung form.
export function AuthPageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <ParallaxLayer depth={0.6} className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-ambient-blob absolute top-[-120px] left-[-100px] h-[380px] w-[380px] rounded-full bg-primary opacity-30 blur-[110px]" />
        <div className="animate-ambient-blob absolute right-[-100px] bottom-[-120px] h-[420px] w-[420px] rounded-full bg-[var(--accent-purple)] opacity-20 blur-[110px]" />
      </ParallaxLayer>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        <Logo />

        <div className="glass-card w-full rounded-2xl p-8 sm:p-10">
          <div className="mb-8 flex flex-col gap-2 text-center">
            <h1 className="font-heading text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </section>
  );
}
