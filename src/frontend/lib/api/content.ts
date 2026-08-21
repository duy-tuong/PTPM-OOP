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
