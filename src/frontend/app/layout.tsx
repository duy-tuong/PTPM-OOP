import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Chạy trước khi paint (next/script strategy="beforeInteractive") để quyết định light/dark TRƯỚC khi
// React hydrate - không dùng headers()/cookies() ở Server Component vì sẽ ép toàn site thành dynamic
// render, mất SSG (bài học từ Phase 6.2c). Admin (/admin/**) giữ nguyên :root (sáng, khoá cứng - không
// đọc theme người dùng chọn ở public, xem MarkdownEditor.tsx/admin/login/page.tsx). Public đọc lựa
// chọn đã lưu ở localStorage ("cloudverse-theme", ghi bởi lib/theme/publicTheme.ts qua ThemeToggle) -
// nếu chưa từng chọn thì theo prefers-color-scheme của hệ điều hành, mặc định dark nếu OS không báo
// light rõ ràng.
// LƯU Ý ĐẶT VỊ TRÍ: <Script> phải là con trực tiếp của <body>, KHÔNG được lồng trong 1 thẻ <head> tự
// viết tay - Next.js luôn tự hoist script strategy="beforeInteractive" vào đúng <head> thật của HTML
// output bất kể đặt ở đâu trong layout, tự đặt nó bên trong <head> viết tay sẽ khiến React coi đây là
// 1 thẻ <script> thường render trong RSC tree (lỗi "Encountered a script tag while rendering React
// component" - đã gặp thật, không phải giả định).
//
// LƯU Ý RIÊNG (khác lỗi trên): dù đã đặt đúng vị trí, console vẫn có thể hiện lại ĐÚNG dòng lỗi
// "Encountered a script tag..." này - đây là false-positive đã xác nhận (không phải do code ở đây)
// từ chính next/script khi dùng strategy="beforeInteractive" + dangerouslySetInnerHTML (script inline,
// không có src) trên Next.js 16.2 + React 19: bản thân next/script nội bộ trả về 1 thẻ <script> JSX
// thật cho trường hợp này (xem node_modules/next/dist/client/script.js, nhánh strategy==="beforeInteractive"
// && !src), và React 19 cảnh báo MỌI thẻ <script> xuất hiện trong cây render dù đây là cơ chế nội bộ hợp
// lệ của Next, không phải lỗi ở app này. Cùng gốc, cùng thông báo y hệt, đã xác nhận qua 3 dự án lớn
// không liên quan (next-themes #387, shadcn/ui #10104, heroui #6348) - chưa có bản vá từ Next.js/React,
// cộng đồng chỉ khuyến nghị lọc bớt dòng console.error này ở dev cho đỡ nhiễu (script vẫn chạy đúng lúc
// SSR, cảnh báo không phản ánh lỗi thật). Lọc phải chạy TRONG trình duyệt (không phải code Node ở
// Server Component này - RootLayout không có "use client" nên code JS thường viết ở đây không hề được
// gửi xuống client) nên gắn thẳng vào chuỗi script inline có sẵn (THEME_INIT_SCRIPT, vốn đã chạy được
// trong trình duyệt qua <Script dangerouslySetInnerHTML>). Chỉ nhúng đoạn lọc khi NODE_ENV=development
// (tính ở server lúc build chuỗi, không dùng `process` trong JS chạy trình duyệt - process không tồn
// tại ở đó) - bản production không mang theo, không âm thầm che giấu cảnh báo thật ở môi trường thật.
const CONSOLE_ERROR_FILTER_SCRIPT =
  process.env.NODE_ENV === "development"
    ? `
  (function () {
    var originalConsoleError = console.error;
    console.error = function () {
      if (typeof arguments[0] === "string" && arguments[0].indexOf("Encountered a script tag") !== -1) return;
      originalConsoleError.apply(console, arguments);
    };
  })();
`
    : "";

const THEME_INIT_SCRIPT = `
  ${CONSOLE_ERROR_FILTER_SCRIPT}
  (function () {
    if (location.pathname.startsWith('/admin')) return;
    var stored = localStorage.getItem('cloudverse-theme');
    var mode = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.classList.add(mode);
  })();
`;

// Pivot 2 (theme "Cloudverse", xem plan Phase 6.2): 3 font đúng bản Stitch dán vào - đã verify cả 3
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
    default: "Cloudverse - Dịch vụ VPS, Hosting, Domain",
    template: "%s | Cloudverse",
  },
  description:
    "Nhà cung cấp dịch vụ VPS, Hosting, Domain, Email doanh nghiệp, SSL và Firewall chống DDoS cho doanh nghiệp và cá nhân tại Việt Nam.",
  icons: {
    icon: "/logo_new.png",
  },
};

// "dark" KHÔNG còn hardcode tĩnh ở <html> (khác Phase 6.2) - giờ Admin (Phase 6.5) đã có nội dung thật
// cần theme sáng, phải phân biệt theo route. "dark" vẫn phải đặt ở <html> (không phải 1 div lồng trong
// (public)/layout.tsx) vì lý do portal: Sheet/Dialog/Dropdown (base-ui) portal thẳng ra document.body,
// là anh em (sibling) chứ không phải hậu duệ của bất kỳ wrapper div nào - đặt dark ở div lồng sẽ khiến
// portal (menu mobile...) không nhận đúng theme. Giải pháp: THEME_INIT_SCRIPT (script chặn-paint, xem
// trên) tự thêm/bỏ class "dark" ở <html> theo pathname trước khi React hydrate - suppressHydrationWarning
// báo cho React biết class này do script ngoài React quản lý, không phải lỗi mismatch thật.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
