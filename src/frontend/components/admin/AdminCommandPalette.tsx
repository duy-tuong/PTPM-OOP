"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AdminSearchResultDto, AdminSearchResultItemDto } from "@/lib/types/admin";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

// Mỗi nhóm khớp đúng 1 key của AdminSearchResultDto (backend, xem AdminSearchService.cs) - Editor sẽ
// chỉ nhận rỗng ở 4 nhóm Admin-only (customers/users/servicePlans/promotions), backend tự lọc theo
// role, ở đây chỉ cần bỏ qua nhóm rỗng khi render, không cần biết trước ai được xem nhóm nào.
const GROUPS: { key: keyof AdminSearchResultDto; label: string }[] = [
  { key: "customers", label: "Khách hàng" },
  { key: "orderRequests", label: "Đơn hàng" },
  { key: "consultationRequests", label: "Yêu cầu tư vấn" },
  { key: "servicePlans", label: "Gói dịch vụ" },
  { key: "newsArticles", label: "Bài viết" },
  { key: "promotions", label: "Khuyến mãi" },
  { key: "users", label: "Nhân viên" },
];

// Command Palette toàn cục cho Admin - thay thế ô tìm kiếm stub cũ ở AdminTopbar.tsx (trước đây bấm
// Enter chỉ hiện toast "đang phát triển"). Mở bằng cách bấm vào ô tìm kiếm HOẶC phím tắt ⌘K/Ctrl+K từ
// bất kỳ đâu trong Admin (khớp gợi ý <kbd> đã có sẵn trong UI). Gọi qua Route Handler
// app/api/admin/search/route.ts (Client Component không đọc được cookie access_token httpOnly).
export function AdminCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AdminSearchResultDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Phím tắt toàn cục - lắng nghe ở document nên hoạt động dù đang focus ở đâu trong trang Admin, không
  // chỉ khi đã bấm vào chính ô tìm kiếm.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus ô input mỗi lần mở - Dialog cần 1 nhịp để mount xong phần Popup rồi mới focus được. Việc
  // xoá trạng thái tìm kiếm khi ĐÓNG lại đặt trong handleOpenChange (event handler) chứ không phải ở
  // đây, tránh gọi setState đồng bộ ngay trong thân effect (react-hooks/set-state-in-effect).
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  // Debounce tìm kiếm - mọi setState đều nằm TRONG callback bất đồng bộ (setTimeout/promise then), không
  // gọi trực tiếp ở thân effect. Query quá ngắn thì không fetch gì cả - phần render bên dưới tự ưu tiên
  // hiện thông báo "nhập thêm ký tự" trước khi xét tới `result` cũ, không cần chủ động xoá `result` ở đây.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      return;
    }

    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      setIsLoading(true);
      fetch(`/api/admin/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => (res.ok ? (res.json() as Promise<AdminSearchResultDto>) : null))
        .then((data) => {
          if (!cancelled) setResult(data);
        })
        .catch(() => {
          if (!cancelled) setResult(null);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Lần mở sau luôn bắt đầu từ ô trống, không giữ lại kết quả của lần tìm trước.
      setQuery("");
      setResult(null);
      setIsLoading(false);
    }
  }

  function handleSelect(item: AdminSearchResultItemDto) {
    handleOpenChange(false);
    router.push(item.url);
  }

  const groupsWithResults = result
    ? GROUPS.map((g) => ({ ...g, items: result[g.key] })).filter((g) => g.items.length > 0)
    : [];
  const hasAnyResult = groupsWithResults.length > 0;
  const trimmedQuery = query.trim();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative hidden max-w-sm flex-1 items-center sm:flex"
      >
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
        <span className="h-9 w-full rounded-full border border-zinc-200/80 bg-zinc-50/50 py-2 pl-9 pr-12 text-left text-[14px] text-zinc-400 transition-all hover:border-zinc-300 hover:bg-white">
          Tìm kiếm...
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <kbd className="hidden rounded-full border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-500 shadow-sm sm:inline-block">
            ⌘K
          </kbd>
        </span>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="top-[15%] max-w-xl translate-y-0 gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-xl"
        >
          <div className="relative border-b border-zinc-100">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm khách hàng, đơn hàng, gói dịch vụ, bài viết..."
              className="h-14 w-full bg-transparent pr-4 pl-11 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none"
            />
            {isLoading && (
              <Loader2 className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-zinc-400" />
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {trimmedQuery.length < MIN_QUERY_LENGTH ? (
              <p className="px-3 py-8 text-center text-sm text-zinc-400">
                Nhập ít nhất {MIN_QUERY_LENGTH} ký tự để tìm kiếm.
              </p>
            ) : !isLoading && !hasAnyResult ? (
              <p className="px-3 py-8 text-center text-sm text-zinc-400">
                Không tìm thấy kết quả nào cho &quot;{trimmedQuery}&quot;.
              </p>
            ) : (
              groupsWithResults.map((group) => (
                <div key={group.key} className="mb-2 last:mb-0">
                  <p className="px-3 py-1.5 text-xs font-semibold tracking-wide text-zinc-400 uppercase">
                    {group.label}
                  </p>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2 text-left transition-colors",
                        "hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none",
                      )}
                    >
                      <span className="text-sm font-medium text-zinc-900">{item.title}</span>
                      {item.subtitle && <span className="text-xs text-zinc-500">{item.subtitle}</span>}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
