import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Cloud, Database, Globe, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { FallbackImage } from "@/components/shared/FallbackImage";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { markdownComponents } from "@/lib/markdown-components";
import type { ContentPageDto } from "@/lib/types/content";

// Ảnh do người dùng tự chèn tay vào - đặt file tại "public/about/our-story.jpg" (đúng tên/định dạng
// này) để hiện ra. Cố tình KHÔNG dùng field ảnh từ backend (ContentPage không có field ảnh, và dựng ảnh
// "đội ngũ"/"văn phòng" giả sẽ là dữ liệu bịa) - đây là 1 file tĩnh do người vận hành site tự cung cấp,
// không phải dữ liệu nghiệp vụ động.
const OUR_STORY_IMAGE_SRC = "/about/our-story.jpg";

// "Editorial Split" bất đối xứng (30/70) - cột trái có chữ "OUR STORY" cực to, mờ (text-foreground/5,
// tự đảo theo Light/Dark thay vì zinc-800 hardcode) để tạo cảm giác tạp chí công nghệ, cộng thêm 1 khối
// ảnh bên dưới; ẩn hẳn ở mobile vì không đủ chỗ và không mang thông tin - cột phải mới là nội dung chính.
// Khối ảnh khoá cứng `aspect-square` + `object-cover` + nằm trong cột riêng (grid `3fr_7fr`) nên DÙ ảnh
// người dùng chèn vào có tỉ lệ/kích thước bất kỳ cũng không bao giờ đẩy lệch/tràn sang cột nội dung bên
// phải (`max-w-prose`) - 2 cột độc lập hoàn toàn về layout. Chưa có ảnh (hoặc ảnh lỗi) thì `FallbackImage`
// tự rơi về khối minh hoạ Cloud/Database/ShieldCheck/Globe (đúng ngôn ngữ hình ảnh thương hiệu, xem
// TrustStrip.tsx/ParticleNetworkBackground.tsx) thay vì hiện icon ảnh vỡ - không bao giờ vỡ giao diện dù
// đã chèn ảnh hay chưa. `page` là ContentPage("gioi-thieu") đã seed thật ở backend, fetch bằng safeFetch ở
// page.tsx (khác quy tắc "throw 404" của slug động trên URL vì đây là dữ liệu phụ trợ cho 1 route CỐ ĐỊNH)
// - null thì ẩn hẳn khối, không hiển thị khung markdown rỗng.
export function AboutStory({ page }: { page: ContentPageDto | null }) {
  if (!page) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[3fr_7fr]">
        {/* Cột trái giữ `position: sticky` trực tiếp trên chính div này - KHÔNG bọc div này bằng
            ScrollReveal (motion.div áp transform sẽ không phá sticky của chính nó, nhưng để chắc chắn
            an toàn tuyệt đối và nhất quán với ArticleToc.tsx (cột sticky duy nhất khác trong dự án, cũng
            không bọc motion), animate từng phần TỬ BÊN TRONG thay vì cả khối sticky). */}
        <div className="hidden lg:sticky lg:top-32 lg:flex lg:h-fit lg:flex-col lg:gap-8">
          <ScrollReveal>
            <span aria-hidden className="font-heading text-6xl leading-none font-bold text-foreground/5 xl:text-7xl">
              OUR
              <br />
              STORY
            </span>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-blue-100 dark:border-blue-900/50">
              <FallbackImage
                src={OUR_STORY_IMAGE_SRC}
                alt="Câu chuyện của Cloudverse"
                className="h-full w-full object-cover"
                fallback={
                  <div
                    aria-hidden
                    className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#EFF6FF] to-[#ECFEFF] dark:from-blue-950/40 dark:to-cyan-950/20"
                  >
                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-400/30 blur-3xl dark:bg-blue-500/20" />
                    <div className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-cyan-400/30 blur-3xl dark:bg-cyan-500/20" />
                    <Cloud
                      weight="duotone"
                      className="absolute top-1/2 left-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400"
                    />
                    <Database weight="fill" className="absolute top-6 left-6 h-8 w-8 text-blue-500/70 dark:text-blue-400/60" />
                    <ShieldCheck weight="fill" className="absolute right-6 bottom-8 h-8 w-8 text-cyan-600/70 dark:text-cyan-400/60" />
                    <Globe weight="fill" className="absolute bottom-6 left-10 h-7 w-7 text-blue-500/60 dark:text-blue-400/50" />
                  </div>
                }
              />
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.05} className="max-w-prose">
          <h2 className="font-heading mb-6 text-3xl font-bold text-foreground sm:text-4xl">{page.title}</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {page.content}
          </ReactMarkdown>
        </ScrollReveal>
      </div>
    </section>
  );
}
