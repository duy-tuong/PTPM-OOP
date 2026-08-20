import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { ArticleToc } from "@/components/news/ArticleToc";
import { ArticleSidebar } from "@/components/news/ArticleSidebar";
import { ReadingProgressBar } from "@/components/news/ReadingProgressBar";
import { CommentSection } from "@/components/news/CommentSection";
import { NewsCard } from "@/components/news/NewsCard";
import { formatDate, slugify } from "@/lib/utils";
import type { ArticleHeading } from "@/lib/utils";
import type { NewsArticleDetailDto, NewsArticleListItemDto, NewsCommentDto } from "@/lib/types/content";

// Bố cục "Tech Docs" 3 cột (TOC 20% - Nội dung 60% - Sidebar 20%) cho /tin-tuc/[slug]. Cột giữa bọc
// max-w-prose (giới hạn ~65 ký tự/dòng cho dễ đọc). content là Markdown thật (Admin soạn qua
// MarkdownEditor.tsx) - render qua react-markdown, heading gắn id bằng đúng slugify() dùng để trích
// headings ở page.tsx (extractHeadings) nên link Mục lục luôn khớp đúng vị trí.
const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2 id={slugify(String(children))} className="mt-16 scroll-mt-32 font-heading text-2xl font-bold text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 id={slugify(String(children))} className="mt-10 scroll-mt-32 font-heading text-xl font-bold text-foreground">
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="text-lg leading-relaxed text-muted-foreground">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-[3px] border-primary pl-6 text-foreground italic">{children}</blockquote>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-lg border border-border bg-background p-4 text-sm">{children}</pre>
  ),
  code: ({ children, className }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{children}</code>
    ),
  img: ({ src, alt }) => (
    <figure className="my-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src as string} alt={alt ?? ""} className="w-full rounded-lg border border-border" />
      {alt && <figcaption className="mt-2 text-center text-xs text-muted-foreground">{alt}</figcaption>}
    </figure>
  ),
};

export function NewsArticleDetail({
  article,
  headings,
  readingMinutes,
  comments,
  relatedArticles,
}: {
  article: NewsArticleDetailDto;
  headings: ArticleHeading[];
  readingMinutes: number;
  comments: NewsCommentDto[];
  relatedArticles: NewsArticleListItemDto[];
}) {
  return (
    <div className="relative">
      <ReadingProgressBar />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-12 gap-y-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_3fr_1fr] lg:px-8">
        <ArticleToc headings={headings} />

        <article className="max-w-prose lg:col-start-2 lg:mx-auto">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Trang chủ
            </Link>
            {" / "}
            <Link href="/tin-tuc" className="hover:text-foreground">
              Tin tức
            </Link>
            {" / "}
            <span className="text-foreground">{article.title}</span>
          </nav>

          <span className="w-fit rounded bg-muted px-3 py-1 text-xs font-medium text-foreground uppercase">
            {article.categoryName}
          </span>
          <h1 className="mt-4 font-heading text-4xl font-bold text-foreground sm:text-5xl">{article.title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {formatDate(article.publishedAt)} • {readingMinutes} phút đọc • {article.viewCount} lượt xem
          </p>

          <div className="mt-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {article.content}
            </ReactMarkdown>
          </div>

          <CommentSection articleId={article.id} comments={comments} />
        </article>

        <ArticleSidebar tags={article.tags} />
      </div>

      {relatedArticles.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="mb-8 font-heading text-2xl font-bold text-foreground">Bài viết liên quan</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {relatedArticles.map((related) => (
              <NewsCard key={related.id} article={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
