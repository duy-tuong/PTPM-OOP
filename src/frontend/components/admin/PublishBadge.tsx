// Pill trạng thái IsPublished - dùng chung cho ContentPagesTable/NewsArticlesTable (Phase 6.8).
// Khác StatusBadge (field isActive) - đây là field isPublished riêng, theo đúng template pill
// "Nổi bật" đã có ở ServicePlansTable.tsx.
export function PublishBadge({ isPublished }: { isPublished: boolean }) {
  if (isPublished) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 ring-1 ring-inset ring-emerald-500/20">
        <div className="size-1.5 rounded-full bg-emerald-500" />
        <span className="text-[12px] font-medium text-emerald-700">Đã xuất bản</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 ring-1 ring-inset ring-zinc-300/40">
      <div className="size-1.5 rounded-full bg-zinc-400" />
      <span className="text-[12px] font-medium text-zinc-600">Bản nháp</span>
    </div>
  );
}
