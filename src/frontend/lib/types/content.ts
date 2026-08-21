import type { PaginationParams } from "./common";

// Khớp Application/Features/Content/NewsCategories/Dtos/NewsCategoryDto.cs
export interface NewsCategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
}

// Khớp Application/Features/Content/NewsArticles/Dtos/*.cs
export interface NewsArticleQueryParams extends PaginationParams {
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
}

export interface NewsArticleListItemDto {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  thumbnailUrl?: string | null;
  publishedAt: string;
  viewCount: number;
  categoryName: string;
  categorySlug: string;
  tags: string[];
}

export interface NewsArticleDetailDto {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  thumbnailUrl?: string | null;
  publishedAt: string;
  viewCount: number;
  categoryName: string;
  categorySlug: string;
  tags: string[];
}

// Khớp Application/Features/Content/NewsComments/Dtos/NewsCommentDto.cs - AuthorEmail KHÔNG lộ ra
// public (khác AdminNewsCommentDto). Replies là cây lồng nhau đã dựng sẵn ở backend.
export interface NewsCommentDto {
  id: number;
  parentCommentId?: number | null;
  authorDisplayName: string;
  content: string;
  createdAt: string;
  replies: NewsCommentDto[];
}

// Khớp Application/Features/Content/NewsComments/Dtos/CreateNewsCommentDto.cs - authorName/authorEmail
// chỉ cần khi gửi với tư cách khách vãng lai (chưa đăng nhập) - backend tự bỏ qua nếu đã đăng nhập.
export interface CreateNewsCommentDto {
  newsArticleId: number;
  parentCommentId?: number;
  authorName?: string;
  authorEmail?: string;
  content: string;
}

// Khớp Application/Features/Content/Faqs/Dtos/FaqDto.cs
export interface FaqDto {
  id: number;
  question: string;
  answer: string;
  serviceCategoryId?: number | null;
  displayOrder: number;
}

// Khớp Application/Features/Content/Testimonials/Dtos/TestimonialDto.cs
export interface TestimonialDto {
  id: number;
  displayName: string;
  companyName?: string | null;
  avatarUrl?: string | null;
  content: string;
  rating?: number | null;
  displayOrder: number;
}

// Khớp Application/Features/Content/Partners/Dtos/PartnerDto.cs
export interface PartnerDto {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  displayOrder: number;
}

// Khớp Application/Features/Content/ContentPages/Dtos/ContentPageDto.cs
export interface ContentPageDto {
  id: number;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  publishedAt?: string | null;
}
