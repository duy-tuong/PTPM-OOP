import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "@/lib/markdown-components";
import type { ContentPageDto } from "@/lib/types/content";

// "Editorial Split" bất đối xứng (30/70) - cột trái chỉ có 1 chữ "OUR STORY" cực to, mờ (text-foreground/5,
// tự đảo theo Light/Dark thay vì zinc-800 hardcode) để tạo cảm giác tạp chí công nghệ; ẩn hẳn ở mobile vì
// không đủ chỗ và không mang thông tin - cột phải mới là nội dung chính. `page` là ContentPage("gioi-thieu")
// đã seed thật ở backend, fetch bằng safeFetch ở page.tsx (khác quy tắc "throw 404" của slug động trên URL
// vì đây là dữ liệu phụ trợ cho 1 route CỐ ĐỊNH) - null thì ẩn hẳn khối, không hiển thị khung markdown rỗng.
export function AboutStory({ page }: { page: ContentPageDto | null }) {
  if (!page) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[3fr_7fr]">
        <div className="hidden lg:sticky lg:top-32 lg:flex lg:h-fit">
          <span aria-hidden className="font-heading text-6xl leading-none font-bold text-foreground/5 xl:text-7xl">
            OUR
            <br />
            STORY
          </span>
        </div>

        <div className="max-w-prose">
          <h2 className="font-heading mb-6 text-3xl font-bold text-foreground sm:text-4xl">{page.title}</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {page.content}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
