import Image from "next/image";
import Link from "next/link";

// Logo + tên site dùng chung cho Navbar và Footer. File nguồn: public/logo_new.png (asset tĩnh trong
// public/ nên dùng next/image, khác với ảnh lấy từ DB seed dùng <img> thường - xem quy ước ảnh/icon
// trong plan Phase 6). Logo mới là ảnh màu (gradient xanh) nền trong suốt - KHÔNG dùng dark:invert
// (chỉ hợp với logo đơn sắc đen/trắng như bản SVG cũ) vì sẽ đảo màu sai; bản thân màu xanh nhạt đã
// đủ tương phản trên cả nền tối (Cloudverse) lẫn nền sáng (Admin).
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`}>
      <Image
        src="/logo_new.png"
        alt="Cloudverse"
        width={1408}
        height={768}
        priority
        className="h-8 w-auto"
      />
      <span className="font-heading text-lg font-semibold tracking-tight">Cloudverse</span>
    </Link>
  );
}