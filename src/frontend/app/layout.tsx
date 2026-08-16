import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Pivot 2 (theme "Claudverse", xem plan Phase 6.2): 3 font đúng bản Stitch dán vào - đã verify cả 3
// đều có subset "vietnamese" trên Google Fonts (khác Geist/Outfit ở pivot 1 - không có subset này).
// Inter = body, Space Grotesk = display/headline, JetBrains Mono = số liệu/countdown/mono.
const bodyFont = Inter({
  variable: "--font-inter",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["vietnamese", "latin"],
  weight: ["500", "600", "700"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["vietnamese", "latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Claudverse - Dịch vụ VPS, Hosting, Domain",
    template: "%s | Claudverse",
  },
  description:
    "Nhà cung cấp dịch vụ VPS, Hosting, Domain, Email doanh nghiệp, SSL và Firewall chống DDoS cho doanh nghiệp và cá nhân tại Việt Nam.",
  icons: {
    icon: "/logo.svg",
  },
};

// "dark" đặt ở <html> (không phải 1 div lồng trong (public)/layout.tsx như dự kiến ban đầu trong
// plan): Sheet/Dialog/Dropdown (base-ui) portal thẳng ra document.body, là anh em (sibling) chứ không
// phải hậu duệ của wrapper div đó - đặt dark ở div lồng sẽ khiến menu mobile (Sheet) không nhận đúng
// biến CSS theme, vẫn hiện sáng dù nền trang đã tối. Đặt ở <html> là quy ước chuẩn của shadcn/next-themes
// cho đúng lý do này. An toàn cho hiện tại vì Admin (Phase 6.6+) chưa có nội dung thật, chỉ placeholder.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`dark ${bodyFont.variable} ${displayFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
