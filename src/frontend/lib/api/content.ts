import { apiFetch } from "./http";
import { getApiUrl } from "./config";
import type { PagedResult } from "@/lib/types/common";
import type {
  NewsCategoryDto,
  NewsArticleQueryParams,
  NewsArticleListItemDto,
  NewsArticleDetailDto,
  NewsCommentDto,
  CreateNewsCommentDto,
  NewsTagDto,
  FaqDto,
  TestimonialDto,
  PartnerDto,
  ContentPageDto,
} from "@/lib/types/content";

export function getNewsCategories(next?: { revalidate?: number | false }) {
  return apiFetch<NewsCategoryDto[]>(getApiUrl(), "/news-categories", "GET", { next });
}

export function getNewsArticles(params: NewsArticleQueryParams = {}, next?: { revalidate?: number | false }) {
  return apiFetch<PagedResult<NewsArticleListItemDto>>(getApiUrl(), "/news-articles", "GET", { params, next });
}

export function getNewsArticleBySlug(slug: string, next?: { revalidate?: number | false }) {
  return apiFetch<NewsArticleDetailDto>(getApiUrl(), `/news-articles/${slug}`, "GET", { next });
}

// Đợt 6 - thay cho cách frontend tự filter theo category rồi loại bài hiện tại (không phân biệt được
// số tag trùng). Backend chấm điểm category+tag (xem NewsArticleService.GetRelatedAsync).
export function getNewsRelatedArticles(slug: string, take?: number, next?: { revalidate?: number | false }) {
  return apiFetch<NewsArticleListItemDto[]>(getApiUrl(), `/news-articles/${slug}/related`, "GET", {
    params: { take },
    next,
  });
}

// "Chủ đề phổ biến" - chỉ trả tag có ít nhất 1 bài viết published.
export function getNewsTags(take?: number, next?: { revalidate?: number | false }) {
  return apiFetch<NewsTagDto[]>(getApiUrl(), "/news-tags", "GET", { params: { take }, next });
}

// Gọi từ Route Handler (app/api/news-view/route.ts), KHÔNG gọi trực tiếp từ Server Component trang chi
// tiết - dedup thật sự (cookie) xảy ra ở Route Handler, xem comment trong route.ts.
export function incrementNewsArticleView(slug: string) {
  return apiFetch<void>(getApiUrl(), `/news-articles/${slug}/view`, "POST", { cache: "no-store" });
}

export function getNewsComments(newsArticleId: number, next?: { revalidate?: number | false }) {
  return apiFetch<NewsCommentDto[]>(getApiUrl(), "/news-comments", "GET", { params: { newsArticleId }, next });
}

export function createNewsComment(dto: CreateNewsCommentDto, token?: string) {
  return apiFetch<NewsCommentDto>(getApiUrl(), "/news-comments", "POST", { body: dto, token, cache: "no-store" });
}

export function getFaqs(serviceCategoryId?: number, next?: { revalidate?: number | false }) {
  return apiFetch<FaqDto[]>(getApiUrl(), "/faqs", "GET", { params: { serviceCategoryId }, next });
}

export function getTestimonials(next?: { revalidate?: number | false }) {
  return apiFetch<TestimonialDto[]>(getApiUrl(), "/testimonials", "GET", { next });
}

export function getPartners(next?: { revalidate?: number | false }) {
  return apiFetch<PartnerDto[]>(getApiUrl(), "/partners", "GET", { next });
}

export function getContentPageBySlug(slug: string, next?: { revalidate?: number | false }) {
  return apiFetch<ContentPageDto>(getApiUrl(), `/content-pages/${slug}`, "GET", { next });
}
