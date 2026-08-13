// Server-only - dùng trong Server Component/Route Handler khi gọi thẳng backend (SSR đọc dữ liệu
// public, hoặc admin đọc lần đầu kèm cookie). KHÔNG import file này từ Client Component.
export function getApiUrl(): string {
  const url = process.env.API_URL;
  if (!url) {
    throw new Error("Thiếu biến môi trường API_URL (server-only) - kiểm tra .env.local.");
  }
  return url;
}

// Browser-only - chỉ dùng cho form public ẩn danh (Phase 6.4) fetch thẳng từ trình duyệt.
export function getPublicApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("Thiếu biến môi trường NEXT_PUBLIC_API_URL (browser) - kiểm tra .env.local.");
  }
  return url;
}
