import Link from "next/link";
import { getNewsArticles, getFaqs } from "@/lib/api/content";
import { safeFetch, emptyPagedResult } from "@/lib/api/safe";
import { FallbackImage } from "@/components/shared/FallbackImage";
import { Reveal } from "@/components/shared/Reveal";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { formatDate } from "@/lib/utils";

// Section 7/9 của Trang chủ (pivot 2 - theme "Claudverse"). Cột trái: tin tức thật (thay blog giả).
// Cột phải: FAQ thật dùng Accordion component chuẩn của dự án (click-toggle, hoạt động trên
// mobile/touch) thay cho cơ chế group-hover:max-h chỉ hoạt động bằng chuột của bản Stitch gốc.
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
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        {articles.length > 0 && (
          <Reveal className="glass-card flex flex-col gap-8 rounded-xl p-10">
            <h2 className="font-heading text-2xl font-bold">Tin Tức Mới</h2>
            <div className="flex flex-col gap-6">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/tin-tuc/${article.slug}`}
                  className="group flex gap-6 rounded-lg transition-colors hover:bg-white/5"
                >
                  <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg">
                    <FallbackImage
                      src={article.thumbnailUrl}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      fallbackClassName="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-medium text-primary"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="mb-1 text-[10px] font-medium tracking-widest text-primary uppercase">
                      {article.categoryName}
                    </span>
                    <h3 className="mb-2 text-base font-medium transition-colors group-hover:text-primary">
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{formatDate(article.publishedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        )}

        {faqs.length > 0 && (
          <Reveal className="glass-card flex flex-col gap-8 rounded-xl p-10" delay={0.1}>
            <h2 className="font-heading text-2xl font-bold">Câu Hỏi Thường Gặp</h2>
            <Accordion>
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={String(faq.id)}>
                  <AccordionTrigger className="font-heading text-base">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        )}
      </div>
    </section>
  );
}
