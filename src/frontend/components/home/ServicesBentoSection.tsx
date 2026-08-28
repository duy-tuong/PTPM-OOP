import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getServiceCategories } from "@/lib/api/catalog";
import { safeFetch } from "@/lib/api/safe";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { getCategoryIcon, isCuratedCategoryIcon } from "@/lib/constants/serviceCategoryIcons";
import { FallbackImage } from "@/components/shared/FallbackImage";
import { cn } from "@/lib/utils";

const HERO_SLUG = "vps";
const BENTO_CATEGORY_COUNT = 6;

export async function ServicesBentoSection() {
  const categories = await safeFetch(() => getServiceCategories({ revalidate: 3600 }), []);

  if (categories.length === 0) {
    return null;
  }

  // Trang chủ chỉ là "điểm nhấn/giới thiệu nhanh", không phải bản sao đầy đủ của /dich-vu (trang đã xây
  // riêng từ Đợt 4 để liệt kê TOÀN BỘ danh mục, có sidebar sticky/scroll-spy, không giới hạn số lượng) -
  // mirror đúng triết lý cap+link-xem-thêm đã áp dụng cho FeaturedPlansSection/NewsFaqSection. Nhiều hơn
  // BENTO_CATEGORY_COUNT thì cắt bớt + thêm 1 thẻ CTA "Xem tất cả" thay vì để trang chủ phình dài vô hạn
  // mỗi khi Admin thêm danh mục mới.
  const hasMoreCategories = categories.length > BENTO_CATEGORY_COUNT;
  const displayedCategories = hasMoreCategories ? categories.slice(0, BENTO_CATEGORY_COUNT) : categories;
  // Layout bento đặc biệt (1 ô hero 2x2 + 5 ô thường lấp vừa khít lưới 3x3) chỉ đúng toán khi có ĐÚNG 6
  // danh mục thật - khi bị cắt bớt (hasMoreCategories=true, categories.length luôn > 6 lúc đó) không
  // dùng bố cục này, vì thêm thẻ CTA thứ 7 vào sẽ phá vỡ phép tính lưới 3x3 đã tinh chỉnh cho 6 ô.
  const useBentoLayout = categories.length === BENTO_CATEGORY_COUNT;

  return (
    <section className="relative w-full border-y border-border/50 bg-muted/10 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-12 flex flex-col gap-4 text-center">
          <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">Danh mục dịch vụ</h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Hệ sinh thái hạ tầng đám mây toàn diện, bảo mật và hiệu suất cao dành riêng cho doanh nghiệp.
          </p>
        </ScrollReveal>

        <div
          className={cn(
            "grid grid-cols-1 gap-5",
            useBentoLayout ? "md:grid-cols-3 md:auto-rows-[200px]" : "md:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {displayedCategories.map((category, index) => {
            const Icon = getCategoryIcon(category.slug);
            const isCurated = isCuratedCategoryIcon(category.slug);
            const isHero = useBentoLayout && category.slug === HERO_SLUG;

            return (
              <ScrollReveal key={category.id} delay={index * 0.08} className={isHero ? "md:col-span-2 md:row-span-2" : undefined}>
                <Link
                  href={`/dich-vu/${category.slug}`}
                  className={cn(
                    "group/card flex h-full flex-col justify-between overflow-hidden rounded-[20px] bg-card border border-border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md",
                    isHero ? "p-8 sm:p-10" : "p-6 sm:p-8"
                  )}
                >
                  <div>
                    <div
                      className={cn(
                        "mb-5 inline-flex items-center justify-center overflow-hidden rounded-xl bg-muted/60 transition-colors duration-300 group-hover/card:bg-primary/10",
                        isHero ? "size-14" : "size-12"
                      )}
                    >
                      {isCurated ? (
                        <Icon
                          className={cn(
                            "text-foreground transition-colors duration-300 group-hover/card:text-primary",
                            isHero ? "size-7" : "size-6"
                          )}
                          weight="fill"
                        />
                      ) : (
                        // Danh mục Admin tự thêm (chưa có icon vector riêng, xem serviceCategoryIcons.ts)
                        // - ưu tiên ảnh Admin tự upload, tự rơi về icon Cpu mặc định nếu chưa upload/tải lỗi.
                        <FallbackImage
                          src={category.iconUrl}
                          alt={category.name}
                          className="size-full object-cover"
                          fallback={
                            <Icon
                              className={cn(
                                "text-foreground transition-colors duration-300 group-hover/card:text-primary",
                                isHero ? "size-7" : "size-6"
                              )}
                              weight="fill"
                            />
                          }
                        />
                      )}
                    </div>
                    
                    <h3 className={cn("font-bold text-foreground tracking-tight mb-2", isHero ? "text-2xl sm:text-3xl" : "text-xl")}>
                      {category.name}
                    </h3>
                    <p className={cn("text-muted-foreground leading-relaxed", isHero ? "text-base sm:text-lg max-w-md" : "text-sm line-clamp-3")}>
                      {category.description}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center gap-1.5 text-sm font-semibold text-primary opacity-80 transition-opacity duration-300 group-hover/card:opacity-100">
                    {isHero ? "Khám phá VPS" : "Tìm hiểu thêm"}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover/card:translate-x-1" weight="bold" />
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}

          {hasMoreCategories && (
            <ScrollReveal delay={displayedCategories.length * 0.08}>
              <Link
                href="/dich-vu"
                className="group/card flex h-full flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-border p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/5 sm:p-8"
              >
                <div className="inline-flex size-12 items-center justify-center rounded-xl bg-muted/60 transition-colors duration-300 group-hover/card:bg-primary/10">
                  <ArrowRight className="size-6 text-foreground transition-colors duration-300 group-hover/card:text-primary" weight="bold" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground">Xem tất cả dịch vụ</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Còn {categories.length - displayedCategories.length} danh mục khác đang chờ bạn khám phá
                  </p>
                </div>
              </Link>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
}
