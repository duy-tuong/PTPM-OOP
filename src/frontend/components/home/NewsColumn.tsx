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

// Cột trái "Tin Tức Mới" - trượt từ dưới lên khi cuộn tới (whileInView, once:false - chạy lại mỗi lần
// cuộn qua), item bên trong xuất hiện tuần tự qua staggerChildren của chính container (không tự tính
// delay={index*x} thủ công). Khối lớn dùng .glass-card (đồng bộ Bento/Featured Plans/Promotion) -
// zoom + vầng sáng khi hover chỉ áp cho từng thẻ tin tức nhỏ bên trong.
export function NewsColumn({ articles }: { articles: NewsArticleListItemDto[] }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-80px" }}
      variants={containerVariants}
      className="glass-card flex flex-col gap-8 rounded-xl p-10"
    >
      <h2 className="font-heading text-2xl font-bold">Tin Tức Mới</h2>
      <div className="flex flex-col gap-6">
        {articles.map((article) => (
          <motion.div key={article.id} variants={itemVariants}>
            <Link
              href={`/tin-tuc/${article.slug}`}
              className="group flex gap-6 rounded-lg border border-border/50 bg-foreground/[0.02] p-4 transition-all duration-300 hover:scale-[1.03] hover:border-primary hover:shadow-[0_0_40px_-4px_color-mix(in_oklch,var(--primary)_40%,transparent)]"
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
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
