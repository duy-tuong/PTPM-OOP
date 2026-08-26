import { Skeleton } from "@/components/ui/skeleton";

// Mirror bố cục thật của /bang-gia (hero -> tab pills -> toolbar -> 2 card) - route có nhiều fetch hơn
// trước (categories/plans/tldPricing/regions/faqs), lần đầu dùng components/ui/skeleton.tsx cho route
// này (cùng pattern đã dùng ở dich-vu/loading.tsx, Đợt 4).
export default function PricingLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-2/3" />
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Skeleton className="h-10 w-48 rounded-full" />
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  );
}
