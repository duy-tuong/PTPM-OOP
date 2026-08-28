import type { Components } from "react-markdown";
import { slugify } from "@/lib/utils";

// Bộ style Markdown dùng chung cho mọi nơi render nội dung CMS thật (NewsArticleDetail.tsx)
// - heading gắn id bằng đúng slugify() dùng để trích headings ở page.tsx (extractHeadings) nên link Mục
// lục (nếu có) luôn khớp đúng vị trí. Toàn bộ màu dùng token (--foreground/--muted/--primary/--border) để
// tự đảo theo Light/Dark, không dùng prose/prose-invert (chưa cài Tailwind Typography trong dự án).
export const markdownComponents: Components = {
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
