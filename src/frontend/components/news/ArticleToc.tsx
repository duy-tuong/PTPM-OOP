"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ArticleHeading } from "@/lib/utils";

// Mục lục sticky + scrollspy cho /tin-tuc/[slug] - đúng kỹ thuật IntersectionObserver đã dùng cho
// ServicesCommandCenter.tsx. Tự ẩn khi bài không có heading nào (đúng dữ liệu thật hiện tại - convention
// "không hiện section rỗng" đã dùng xuyên suốt dự án).
export function ArticleToc({ headings }: { headings: ArticleHeading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="hidden lg:sticky lg:top-32 lg:col-start-1 lg:block lg:h-fit">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Mục lục</p>
      <ul className="mt-4 flex flex-col gap-1">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block border-l-2 py-1 text-sm transition-colors",
                heading.level === 3 ? "pl-8" : "pl-4",
                activeId === heading.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
