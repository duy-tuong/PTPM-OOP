import Image from "next/image";
import Link from "next/link";

// Logo + tên site dùng chung cho Navbar và Footer. File nguồn: public/logo.svg (asset tĩnh trong
// public/ nên dùng next/image, khác với ảnh lấy từ DB seed dùng <img> thường - xem quy ước ảnh/icon
// trong plan Phase 6). SVG gốc tô màu đen cứng (fill="#000000") - dùng dark:invert để tự chuyển
// trắng khi nằm trong scope .dark (trang public, theme Claudverse), giữ đen ở :root (Admin sau này).
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`}>
      <Image
        src="/logo.svg"
        alt="Claudverse"
        width={139}
        height={75}
        priority
        className="h-8 w-auto dark:invert"
      />
      <span className="font-heading text-lg font-semibold tracking-tight">Claudverse</span>
    </Link>
  );
}