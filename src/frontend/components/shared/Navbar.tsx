"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { List } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";
import {
  CUSTOMER_SESSION_CHANGED_EVENT,
  notifyCustomerSessionChanged,
  readCustomerSessionCookie,
} from "@/lib/auth/customerSessionClient";
import type { CustomerSessionUser } from "@/lib/types/customerAuth";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/dich-vu", label: "Dịch vụ" },
  { href: "/bang-gia", label: "Bảng giá" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/khach-hang", label: "Khách hàng" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/doi-tac", label: "Đối tác" },
];

// CTA duy nhất cho toàn site = "Đặt dịch vụ" (Design System - CTA wording lock, không đổi thành
// "Bắt đầu ngay"/"Liên hệ ngay"/... ở bất kỳ trang nào khác).
// "Floating Pill" Header (thay full-bleed dính mép cũ) - nổi cách top 16px, bo rounded-full, chất liệu
// .glass-pill (đậm + viền trung tính, khác .glass-card). CTA trắng-đen solid (bg-foreground/text-background,
// tự đảo theo Light/Dark) thay vì cyan-glow trước đây; "Đăng ký" ẩn khỏi Navbar (LoginForm.tsx đã có
// sẵn link phụ tới /register, không thành ngõ cụt). Smart Scroll: ẩn khi cuộn xuống, hiện lại khi cuộn
// lên (kể cả 1 chút) - tắt hẳn khi prefers-reduced-motion (cùng convention guard ParallaxLayer/NetworkField).
// Layout (public)/layout.tsx bù `pt-24` cho <main> (16px top-gap + 56px pill + khoảng thở) vì nav không
// chiếm chỗ trong flow.
// Đọc cookie "customer_session" trực tiếp phía client (lib/auth/customerSessionClient.ts) thay vì
// nhận qua prop từ Server Component layout - cố ý tránh gọi cookies() ở app/(public)/layout.tsx vì
// sẽ ép toàn bộ route group public thành dynamic render, mất SSG/ISR của từng trang. Cái giá đánh đổi:
// session hiện ra sau 1 nhịp useEffect (sau mount) thay vì có sẵn ngay từ SSR - chấp nhận được cho 1
// dòng chào tên trên Navbar.
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<CustomerSessionUser | null>(null);
  const [hidden, setHidden] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function syncSession() {
      setSession(readCustomerSessionCookie());
    }

    syncSession();
    window.addEventListener(CUSTOMER_SESSION_CHANGED_EVENT, syncSession);
    return () => window.removeEventListener(CUSTOMER_SESSION_CHANGED_EVENT, syncSession);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lastY = window.scrollY;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        if (y < 80) setHidden(false);
        else if (delta > 8) setHidden(true);
        else if (delta < -8) setHidden(false);
        lastY = y;
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    await fetch("/api/customer-auth/logout", { method: "POST" });
    notifyCustomerSessionChanged();
    router.push("/");
  }

  return (
    <header
      className={cn(
        "glass-pill fixed inset-x-0 top-4 z-40 mx-auto w-[calc(100%-2rem)] max-w-6xl rounded-full transition-transform duration-300",
        hidden && "-translate-y-24 opacity-0",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute left-1/2 -bottom-2 h-1 w-1 -translate-x-1/2 scale-0 rounded-full bg-primary transition-transform duration-200 group-hover:scale-100" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {session ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium text-foreground">Xin chào, {session.fullName}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Đăng nhập
            </Link>
          )}

          <ThemeToggle />

          <MagneticButton>
            <Button
              nativeButton={false}
              className="rounded-full bg-foreground font-bold text-background hover:bg-foreground/90"
              render={<Link href="/lien-he">Đặt dịch vụ</Link>}
            />
          </MagneticButton>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Mở menu điều hướng" />}
          >
            <List className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
            <nav className="mt-10 flex flex-col gap-4 px-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-foreground"
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-1 border-t border-border" />

              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-foreground">Giao diện</span>
                <ThemeToggle />
              </div>

              {session ? (
                <>
                  <span className="text-base font-medium text-foreground">Xin chào, {session.fullName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="text-left text-base font-medium text-muted-foreground"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="text-base font-medium text-foreground">
                  Đăng nhập
                </Link>
              )}

              <Button
                nativeButton={false}
                className="mt-2 rounded-full bg-foreground font-bold text-background hover:bg-foreground/90"
                render={
                  <Link href="/lien-he" onClick={() => setOpen(false)}>
                    Đặt dịch vụ
                  </Link>
                }
              />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
