import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminTestimonials } from "@/lib/api/admin/testimonials";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { TestimonialsManager } from "@/components/admin/testimonials/TestimonialsManager";

export const metadata: Metadata = {
  title: "Quản lý đánh giá khách hàng",
};

export default async function AdminTestimonialsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const testimonials = await getAdminTestimonials(getApiUrl(), token);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <TestimonialsManager testimonials={testimonials} />
      </div>
    </div>
  );
}
