import type { ReactNode } from "react";
import { Logo } from "@/components/shared/Logo";


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
