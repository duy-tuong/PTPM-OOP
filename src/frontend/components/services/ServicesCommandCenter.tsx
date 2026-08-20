"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { getCategoryIcon } from "@/lib/constants/serviceCategoryIcons";
import { cn } from "@/lib/utils";
import type { ServiceCategoryDto } from "@/lib/types/catalog";

// Bố cục "Command Center" (Sticky Sidebar, thay Zig-Zag) cho /dich-vu - cột trái sticky theo dõi vị
// trí cuộn qua IntersectionObserver (scroll-spy, kỹ thuật lần đầu dùng thủ công trong codebase - khác
// ScrollReveal vốn dùng whileInView của Framer Motion chỉ cho hiệu ứng xuất hiện, không đồng bộ active
// state), cột phải là các card lớn xếp dọc. KHÔNG giới hạn số danh mục - đây chính là lý do chọn bố
// cục này thay Zig-Zag (tự scale, không cần cắt/đổ xuống grid phụ khi Admin thêm nhiều danh mục).
export function ServicesCommandCenter({ categories }: { categories: ServiceCategoryDto[] }) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? "");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  function scrollToSection(slug: string) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sectionRefs.current[slug]?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="sticky top-20 z-30 -mx-4 mb-8 flex gap-2 overflow-x-auto bg-background/80 px-4 py-3 backdrop-blur-sm lg:hidden">
        {categories.map((category) => (
          <a
            key={category.slug}
            href={`#${category.slug}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(category.slug);
            }}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeSlug === category.slug ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {category.name}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_7fr]">
        <nav className="hidden flex-col gap-1 lg:sticky lg:top-28 lg:flex lg:h-fit lg:self-start">
          {categories.map((category) => (
            <a
              key={category.slug}
              href={`#${category.slug}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(category.slug);
              }}
              className={cn(
                "relative py-2 pl-4 text-sm font-medium transition-colors",
                activeSlug === category.slug ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {activeSlug === category.slug && (
                <span className="absolute top-0 left-0 h-full w-0.5 rounded-full bg-primary" />
              )}
              {category.name}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-6">
          {categories.map((category, index) => {
            const Icon = getCategoryIcon(category.slug);

            return (
              <ScrollReveal key={category.id}>
                <section
                  id={category.slug}
                  ref={(el) => {
                    sectionRefs.current[category.slug] = el;
                  }}
                  className="glass-card relative flex min-h-[13rem] scroll-mt-28 flex-col justify-between overflow-hidden rounded-2xl p-6 lg:p-8"
                >
                  <Icon
                    aria-hidden
                    weight="fill"
                    className="pointer-events-none absolute -right-6 -bottom-6 size-40 text-foreground/5"
                  />
                  <div className="relative z-10 flex flex-col gap-2">
                    <span className="text-xs font-medium text-primary">0{index + 1}</span>
                    <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">{category.name}</h2>
                    {category.description && (
                      <p className="max-w-xl text-sm text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                  <div className="relative z-10 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      className="border-primary text-primary hover:bg-primary/10"
                      render={
                        <Link href={`/dich-vu/${category.slug}`}>
                          Tìm hiểu thêm
                          <ArrowRight className="size-4" />
                        </Link>
                      }
                    />
                  </div>
                </section>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
