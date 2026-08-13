import type { ProblemDetails } from "@/lib/types/common";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Khớp tuỳ chọn cache của Next.js fetch (revalidate/tags) - tự định nghĩa để không phụ thuộc
// type nội bộ của Next, vẫn tương thích vì fetch của Next.js đọc đúng field "next" này.
interface NextFetchOptions {
  revalidate?: number | false;
  tags?: string[];
}

export interface ApiOptions {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  token?: string;
  cache?: RequestCache;
  next?: NextFetchOptions;
}

export class ApiError extends Error {
  readonly status: number;
  readonly problem?: ProblemDetails;

  constructor(status: number, problem?: ProblemDetails) {
    super(problem?.detail ?? problem?.title ?? `Yêu cầu API thất bại (status ${status}).`);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }
}

function buildQueryString(params?: ApiOptions["params"]): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// Helper thấp cấp duy nhất mọi module lib/api/*.ts dùng chung - không dùng codegen/client tổng
// quát, mỗi endpoint được gọi qua 1 hàm riêng ở module domain tương ứng (xem lib/api/catalog.ts...).
export async function apiFetch<T>(
  baseUrl: string,
  path: string,
  method: HttpMethod,
  options: ApiOptions = {},
): Promise<T> {
  const url = `${baseUrl}${path}${buildQueryString(options.params)}`;
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: options.cache,
    next: options.next,
  });

  if (!res.ok) {
    let problem: ProblemDetails | undefined;
    try {
      problem = (await res.json()) as ProblemDetails;
    } catch {
      // response không có body JSON (vd 401 rỗng) - bỏ qua, ApiError vẫn có status
    }
    throw new ApiError(res.status, problem);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  return undefined as T;
}
