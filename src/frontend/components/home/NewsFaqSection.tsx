import { getNewsArticles, getFaqs } from "@/lib/api/content";
import { safeFetch, emptyPagedResult } from "@/lib/api/safe";
import { NewsColumn } from "@/components/home/NewsColumn";
import { FaqColumn } from "@/components/home/FaqColumn";

// Section 7/9 của Trang chủ - Minimalist B2B SaaS (solid zinc-900/zinc-800, không gradient). Server
// Component chỉ fetch dữ liệu thật (không bịa) và điều phối - NewsColumn/FaqColumn (Client Component)
// xử lý phần motion/tương tác (whileInView 2 chiều, stagger children, FAQ hover-to-expand).
export async function NewsFaqSection() {
  const [newsResult, faqs] = await Promise.all([
    safeFetch(() => getNewsArticles({ pageSize: 3 }, { revalidate: 900 }), emptyPagedResult(3)),
    safeFetch(() => getFaqs(undefined, { revalidate: 3600 }), []),
  ]);

  const articles = newsResult.items;

  if (articles.length === 0 && faqs.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {articles.length > 0 && <NewsColumn articles={articles} />}
        {faqs.length > 0 && <FaqColumn faqs={faqs} />}
      </div>
    </section>
  );
}
