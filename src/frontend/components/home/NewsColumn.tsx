"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FallbackImage } from "@/components/shared/FallbackImage";
import { formatDate } from "@/lib/utils";
import type { NewsArticleListItemDto } from "@/lib/types/content";

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as const, staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const } },
};

export function NewsColumn({ articles }: { articles: NewsArticleListItemDto[] }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-80px" }}
      variants={containerVariants}
      className="flex flex-col gap-6"
    >
      <h2 className="font-heading text-2xl font-bold text-foreground">Tin tức mới</h2>
      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <motion.div key={article.id} variants={itemVariants}>
            <Link
              href={`/tin-tuc/${article.slug}`}
              className="group flex gap-5 rounded-xl border border-border bg-card/50 p-4 shadow-sm transition-all duration-300 hover:bg-card hover:shadow-md"
            >
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md border border-border">
                <FallbackImage
                  src={article.thumbnailUrl}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  fallbackClassName="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-medium text-primary"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="mb-1.5 text-[10px] font-bold tracking-widest text-primary uppercase">
                  {article.categoryName}
                </span>
                <h3 className="mb-2 text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs font-medium text-muted-foreground">{formatDate(article.publishedAt)}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
