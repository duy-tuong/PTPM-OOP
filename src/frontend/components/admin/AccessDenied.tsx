// Fallback dùng chung cho các trang Admin-only khi Editor truy cập thẳng URL - mirror khối thông báo
// giới hạn quyền đã có sẵn ở dashboard/page.tsx và audit-logs/page.tsx.
export function AccessDenied({ message }: { message?: string }) {
  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <div className="rounded-[24px] border border-zinc-200/60 bg-white p-6 text-sm text-zinc-500 shadow-sm ring-1 ring-zinc-950/5">
          {message ?? "Bạn không có quyền truy cập trang này. Vui lòng liên hệ Admin nếu cần hỗ trợ."}
        </div>
      </div>
    </div>
  );
}
