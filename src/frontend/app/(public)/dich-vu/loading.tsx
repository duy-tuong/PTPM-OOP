import { Skeleton } from "@/components/ui/skeleton";

// Route mới có nhiều fetch hơn trước (categories + plans + faqs + regions + tldPricing) - lần đầu dùng
// components/ui/skeleton.tsx ở public site (trước đây mọi trang public đều SSR xong mới render, không
// có state loading). Mirror bố cục thật: Hero -> sidebar+card danh mục, để tránh layout-shift rõ rệt.
export default function ServicesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-2/3" />
      </div>

      <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[3fr_7fr]">
        <div className="hidden flex-col gap-4 lg:flex">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-32" />
          ))}
        </div>
        <div className="flex flex-col gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
