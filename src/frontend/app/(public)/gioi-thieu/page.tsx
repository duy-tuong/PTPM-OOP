import type { Metadata } from "next";
import { getContentPageBySlug } from "@/lib/api/content";
import { safeFetch } from "@/lib/api/safe";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutStory } from "@/components/about/AboutStory";
import { AboutValuesBento } from "@/components/about/AboutValuesBento";
import { TrustStrip } from "@/components/home/TrustStrip";
import { TestimonialsGridSection } from "@/components/home/TestimonialsGridSection";
import type { ContentPageDto } from "@/lib/types/content";

const ABOUT_SLUG = "gioi-thieu";

// ContentPage("gioi-thieu") là dữ liệu phụ trợ cho 1 route CỐ ĐỊNH (không phải slug động trên URL như
// /tin-tuc/[slug]) - dùng safeFetch + ẩn khối Story nếu rỗng, không notFound() cả trang khi admin lỡ xoá.
// TrustStrip/TestimonialsGridSection tự fetch getPartners()/getTestimonials() bên trong, không fetch lại
// ở đây.
function loadAboutPage() {
  return safeFetch<ContentPageDto | null>(() => getContentPageBySlug(ABOUT_SLUG, { revalidate: 3600 }), null);
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadAboutPage();
  return {
    title: page?.metaTitle ?? "Giới thiệu",
    description: page?.metaDescription ?? "Tìm hiểu về Cloudverse - nền tảng hạ tầng Cloud cho doanh nghiệp Việt.",
  };
}

export default async function AboutPage() {
  const page = await loadAboutPage();

  return (
    <>
      <AboutHero description={page?.metaDescription} />
      <AboutStory page={page} />
      <AboutValuesBento />
      <TrustStrip />
      <TestimonialsGridSection />
    </>
  );
}
