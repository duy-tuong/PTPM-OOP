import { getNewsArticles, getFaqs } from "@/lib/api/content";
import { safeFetch, emptyPagedResult } from "@/lib/api/safe";
import { NewsColumn } from "@/components/home/NewsColumn";
import { FaqColumn } from "@/components/home/FaqColumn";

// Section 7/9 của Trang chủ - Minimalist B2B SaaS (solid zinc-900/zinc-800, không gradient). Server
// Component chỉ fetch dữ liệu thật (không bịa) và điều phối - NewsColumn/FaqColumn (Client Component)
// xử lý phần motion/tương tác (whileInView 2 chiều, stagger children, FAQ hover-to-expand).
const HOME_FAQ_COUNT = 3;

export async function NewsFaqSection() {
  const [newsResult, allFaqs] = await Promise.all([
    safeFetch(() => getNewsArticles({ pageSize: 3 }, { revalidate: 900 }), emptyPagedResult(3)),
    // GET /faqs không hỗ trợ phân trang (trả về TOÀN BỘ FAQ đang active, xem lib/api/content.ts) -
    // cắt bớt ở đây cho khớp với cột Tin tức bên cạnh (luôn cố định 3 dòng), tránh cột FAQ kéo dài lệch
    // hẳn khi Admin bật nhiều FAQ. FAQ đầy đủ vẫn xem hết ở /dich-vu, /bang-gia (FaqColumn ở đó không cắt).
    safeFetch(() => getFaqs(undefined, { revalidate: 3600 }), []),
  ]);

  const articles = newsResult.items;
  const faqs = allFaqs.slice(0, HOME_FAQ_COUNT);

  if (articles.length === 0 && faqs.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[20px] border border-blue-100 bg-gradient-to-br from-[#EFF6FF] to-[#ECFEFF] p-6 shadow-sm dark:border-blue-900/50 dark:from-blue-950/40 dark:to-cyan-950/20 md:p-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {articles.length > 0 && <NewsColumn articles={articles} />}
          {faqs.length > 0 && <FaqColumn faqs={faqs} />}
        </div>
      </div>
    </section>
  );
}
