import { apiFetch } from "./http";
import { getApiUrl } from "./config";
import type { PagedResult } from "@/lib/types/common";
import type {
  NewsCategoryDto,
  NewsArticleQueryParams,
  NewsArticleListItemDto,
  NewsArticleDetailDto,
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
