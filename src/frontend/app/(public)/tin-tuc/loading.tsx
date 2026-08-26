import { Skeleton } from "@/components/ui/skeleton";

// Mirror bố cục thật của /tin-tuc (35/65 split-screen) - route có nhiều fetch hơn (categories/
// articles/featured/popular/tags), cùng pattern đã dùng ở dich-vu/loading.tsx và bang-gia/loading.tsx.
export default function NewsLoading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:gap-12 lg:px-8">
      <div className="flex flex-col gap-8 lg:w-[35%]">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="hidden flex-col gap-3 lg:flex">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-32 rounded-full" />
          ))}
        </div>
      </div>

      <div className="lg:w-[65%]">
        <Skeleton className="mb-6 h-10 w-full max-w-sm" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
