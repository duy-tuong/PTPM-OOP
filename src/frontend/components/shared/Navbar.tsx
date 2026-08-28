"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { List, ShoppingCart, User } from "@phosphor-icons/react";
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
import { NotificationBell } from "@/components/shared/NotificationBell";
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

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<CustomerSessionUser | null>(null);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
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

        // Handle scroll state for styling
        setScrolled(y > 20);

        // Handle auto-hide
        if (y < 80) setHidden(false);
        else if (delta > 8) setHidden(true);
        else if (delta < -8) setHidden(false);

        lastY = y;
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial check
    setScrolled(window.scrollY > 20);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    await fetch("/api/customer-auth/logout", { method: "POST" });
    cart.clear();
    notifyCustomerSessionChanged();
    router.push("/");
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-4 z-40 mx-auto w-[calc(100%-2rem)] max-w-6xl rounded-[24px] transition-all duration-300",
        hidden ? "-translate-y-24 opacity-0" : "translate-y-0 opacity-100",
        scrolled
          ? "bg-muted/80 backdrop-blur-md border border-border/50 shadow-sm"
          : "bg-muted/40 backdrop-blur-sm border border-transparent"
      )}
    >
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 flex flex-1 items-center justify-start">
          <Logo />
        </div>

        <nav className="hidden items-center justify-center gap-6 lg:gap-8 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[14px] font-medium transition-colors hover:text-foreground",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative z-10 hidden flex-1 items-center justify-end gap-3 lg:gap-4 lg:flex">
          <div className="flex items-center gap-1">
            {session && <NotificationBell />}

            <Link
              href="/gio-hang"
              aria-label={cartCount > 0 ? `Giỏ hàng, ${cartCount} sản phẩm` : "Giỏ hàng"}
              className="relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>

            <ThemeToggle className="rounded-full" />

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="group ml-1 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="size-9 transition-transform group-hover:scale-105 border border-border/50">
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
                aria-label="Đăng nhập"
                className="relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <User className="size-5" />
              </Link>
            )}
          </div>

          <div className="mx-1 h-5 w-px bg-border/60" />

          <MagneticButton>
            <Button
              nativeButton={false}
              className="rounded-full bg-primary px-6 font-medium text-primary-foreground hover:bg-primary-hover hover:shadow-md transition-all border-0"
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
            <nav className="mt-10 flex flex-col gap-5 px-4">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "text-base transition-colors",
                      isActive ? "font-semibold text-foreground" : "font-medium text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {session && <NotificationBell variant="row" />}

              <Link
                href="/gio-hang"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between text-base font-medium text-muted-foreground hover:text-foreground mt-2"
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

              <div className="my-2 border-t border-border/50" />

              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-muted-foreground">Giao diện</span>
                <ThemeToggle />
              </div>

              {session ? (
                <div className="flex flex-col gap-4 mt-2">
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
                    className="text-left text-base font-medium text-muted-foreground hover:text-destructive"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="text-base font-medium text-foreground mt-2">
                  Đăng nhập
                </Link>
              )}

              <Button
                nativeButton={false}
                className="mt-4 rounded-full bg-primary py-6 font-medium text-primary-foreground hover:bg-primary-hover shadow-sm transition-all border-0"
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
