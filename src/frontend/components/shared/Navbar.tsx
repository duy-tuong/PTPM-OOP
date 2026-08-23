"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { List, ShoppingCart } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
import {
  CUSTOMER_SESSION_CHANGED_EVENT,
  notifyCustomerSessionChanged,
  readCustomerSessionCookie,
} from "@/lib/auth/customerSessionClient";
import type { CustomerSessionUser } from "@/lib/types/customerAuth";
import { useCart } from "@/lib/cart/CartContext";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/dich-vu", label: "Dịch vụ" },
  { href: "/bang-gia", label: "Bảng giá" },
  { href: "/tin-tuc", label: "Tin tức" },
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
  const cart = useCart();
  const cartCount = cart.items.length;

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
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 flex items-center">
          <Logo />
        </div>

        <nav className="pointer-events-none absolute inset-0 hidden items-center justify-center gap-6 lg:flex z-0">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="pointer-events-auto group relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute left-1/2 -bottom-2 h-1 w-1 -translate-x-1/2 scale-0 rounded-full bg-primary transition-transform duration-200 group-hover:scale-100" />
            </Link>
          ))}
        </nav>

        <div className="relative z-10 hidden items-center gap-4 lg:flex">
          <Link
            href="/lien-he"
            aria-label={cartCount > 0 ? `Giỏ hàng, ${cartCount} sản phẩm` : "Giỏ hàng"}
            className="relative inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          <ThemeToggle />

          <div className="mx-1 h-6 w-px bg-border/60" />

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="group rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar className="size-8 transition-transform group-hover:scale-105 border border-border/50">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                    {getInitials(session.fullName)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" sideOffset={12}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.fullName}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/khach-hang" />} className="cursor-pointer">
                  Bảng điều khiển
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/khach-hang/don-hang" />} className="cursor-pointer">
                  Lịch sử đơn hàng
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Đăng nhập
            </Link>
          )}

          <MagneticButton>
            <Button
              nativeButton={false}
              className="rounded-full bg-primary font-bold text-primary-foreground hover:bg-primary/90 shadow-[0_4px_14px_0_color-mix(in_oklch,var(--primary)_39%,transparent)] hover:shadow-[0_6px_20px_color-mix(in_oklch,var(--primary)_23%,transparent)] hover:-translate-y-0.5 transition-all"
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

              <Link
                href="/lien-he"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between text-base font-medium text-foreground"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="size-5" />
                  Giỏ hàng
                </span>
                {cartCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="my-1 border-t border-border" />

              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-foreground">Giao diện</span>
                <ThemeToggle />
              </div>

              {session ? (
                <>
                  <Link
                    href="/khach-hang"
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-foreground"
                  >
                    Xin chào, {session.fullName}
                  </Link>
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
                className="mt-2 rounded-full bg-primary font-bold text-primary-foreground hover:bg-primary/90 shadow-[0_4px_14px_0_color-mix(in_oklch,var(--primary)_39%,transparent)] transition-all"
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
