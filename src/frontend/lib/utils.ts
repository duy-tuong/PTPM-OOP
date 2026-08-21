import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatDate(value: string | Date): string {
  return dateFormatter.format(typeof value === "string" ? new Date(value) : value);
}

// Dùng cho auto-fill Slug từ Name (Admin Catalog CRUD, Phase 6.7) - bỏ dấu tiếng Việt, lowercase,
// nối dấu gạch ngang. User vẫn có thể tự sửa Slug thủ công sau khi auto-fill.
const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Trích H2/H3 từ content Markdown của bài tin tức (/tin-tuc/[slug]) để dựng Mục lục - id dùng lại đúng
// slugify() ở trên, khớp với id gắn trong custom heading renderer của react-markdown (NewsArticleDetail.tsx)
// để link mục lục nhảy đúng vị trí.
export interface ArticleHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function extractHeadings(markdown: string): ArticleHeading[] {
  return markdown.split("\n").flatMap((line): ArticleHeading[] => {
    const match = line.match(/^(#{2,3})\s+(.*)$/);
    if (!match) return [];
    const text = match[2].trim();
    return [{ id: slugify(text), text, level: match[1].length as 2 | 3 }];
  });
}

// Dùng cho ExportButton (Phase 6.9) - trigger tải file nhị phân (vd .xlsx) từ 1 Blob đã fetch sẵn.
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
