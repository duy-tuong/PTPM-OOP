import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { EnvelopeSimple, Phone, MapPin } from "@phosphor-icons/react/dist/ssr";
import { getServiceCategories } from "@/lib/api/catalog";
import { safeFetch } from "@/lib/api/safe";

const FOOTER_LINKS = {
  company: {
    title: "Cloudverse",
    links: [
      { href: "/gioi-thieu", label: "Giới thiệu" },
      { href: "/ve-chung-toi", label: "Về chúng tôi" },
      { href: "/lien-he", label: "Liên hệ" },
    ],
  },
  support: {
    title: "Hỗ trợ",
    links: [
      { href: "/tro-giup", label: "Trung tâm trợ giúp" },
      { href: "/faq", label: "FAQ" },
      { href: "/chinh-sach", label: "Chính sách" },
      { href: "/dieu-khoan", label: "Điều khoản" },
    ],
  },
};

// Đợt 4 (nâng cấp trang Dịch vụ) - cột "Dịch vụ" trước đây hardcode 6 slug cố định (vd /dich-vu/email,
// /dich-vu/firewall) không khớp slug thật trong DB (email-doanh-nghiep, firewall-chong-ddos) và thiếu
// hẳn category thêm sau (vd cloud-backup) - đúng kiểu "dữ liệu nghiệp vụ giả trong navigation". Footer
// dùng chung toàn site public (app/(public)/layout.tsx) nên chuyển thành async Server Component, fetch
// category thật y hệt cách TrustStrip.tsx/ServicesBentoSection.tsx đang làm ở trang chủ.
export async function Footer() {
  const year = new Date().getFullYear();
  const categories = await safeFetch(() => getServiceCategories({ revalidate: 3600 }), []);
  const serviceLinks = [...categories]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((category) => ({ href: `/dich-vu/${category.slug}`, label: category.name }));

  return (
    <footer className="relative z-10 border-t border-border/50 bg-background pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-6 lg:gap-8">
          
          {/* Logo & Intro */}
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Nhà cung cấp hạ tầng Cloud, VPS, Hosting, Domain và giải pháp an ninh mạng toàn diện cho doanh nghiệp Việt Nam.
            </p>
          </div>

          {/* Links: Cloudverse */}
          <div className="lg:col-span-1">
            <h3 className="font-heading text-sm font-bold text-foreground">{FOOTER_LINKS.company.title}</h3>
            <ul className="mt-6 flex flex-col gap-3">
              {FOOTER_LINKS.company.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links: Dịch vụ */}
          {serviceLinks.length > 0 && (
            <div className="lg:col-span-1">
              <h3 className="font-heading text-sm font-bold text-foreground">Dịch vụ</h3>
              <ul className="mt-6 flex flex-col gap-3">
                {serviceLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Links: Hỗ trợ */}
          <div className="lg:col-span-1">
            <h3 className="font-heading text-sm font-bold text-foreground">{FOOTER_LINKS.support.title}</h3>
            <ul className="mt-6 flex flex-col gap-3">
              {FOOTER_LINKS.support.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1">
            <h3 className="font-heading text-sm font-bold text-foreground">Liên hệ</h3>
            <ul className="mt-6 flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <EnvelopeSimple className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                  support@cloudverse.vn
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                  1900 1234
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Toà nhà Cloudverse, Quận 1, TP.HCM
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
          <p className="text-sm font-medium text-muted-foreground">
            © {year} Cloudverse. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400">
              Facebook
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400">
              LinkedIn
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-blue-600 dark:hover:text-blue-400">
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
