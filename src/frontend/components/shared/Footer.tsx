import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

const SERVICE_LINKS = [
  { href: "/dich-vu", label: "Dịch vụ" },
  { href: "/bang-gia", label: "Bảng giá" },
  { href: "/tin-tuc", label: "Tin tức" },
];

const COMPANY_LINKS = [
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/khach-hang", label: "Khách hàng" },
  { href: "/doi-tac", label: "Đối tác" },
  { href: "/lien-he", label: "Liên hệ" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Nhà cung cấp dịch vụ VPS, Hosting, Domain, Email doanh nghiệp, SSL và Firewall chống
            DDoS cho doanh nghiệp và cá nhân tại Việt Nam.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium">Dịch vụ</h3>
          <ul className="mt-4 space-y-3">
            {SERVICE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium">Công ty</h3>
          <ul className="mt-4 space-y-3">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">© {year} Cloudverse. Bảo lưu mọi quyền.</p>
      </div>
    </footer>
  );
}
