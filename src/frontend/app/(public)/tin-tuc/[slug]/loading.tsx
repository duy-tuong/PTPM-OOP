import { Skeleton } from "@/components/ui/skeleton";

// Mirror bố cục "Tech Docs" 3 cột thật của /tin-tuc/[slug] (TOC - nội dung - sidebar).
export default function NewsArticleLoading() {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-12 gap-y-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_3fr_1fr] lg:px-8">
      <div className="hidden lg:flex lg:flex-col lg:gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>

      <div className="max-w-prose lg:col-start-2 lg:mx-auto lg:w-full">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-6 h-6 w-24 rounded" />
        <Skeleton className="mt-4 h-12 w-full" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <div className="mt-10 flex flex-col gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-col lg:gap-8">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}
