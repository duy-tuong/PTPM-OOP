// Server-only - dùng trong Server Component/Route Handler khi gọi thẳng backend (SSR đọc dữ liệu
// public, hoặc admin đọc lần đầu kèm cookie). KHÔNG import file này từ Client Component.
export function getApiUrl(): string {
  return process.env.API_URL || "http://backend:5000/api";
}

// Browser-only - chỉ dùng cho form public ẩn danh (Phase 6.4) fetch thẳng từ trình duyệt.
export function getPublicApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://35.254.67.105:5000/api";
}
