// Khớp CloudServiceStore.Application/Common/Models/{PagedResult,PaginationParams}.cs

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  // Index signature để mọi *QueryParams kế thừa từ đây gán được thẳng vào ApiOptions.params
  // (Record<string, ...>) khi gọi apiFetch mà không bị TS báo "index signature missing".
  [key: string]: string | number | boolean | undefined;
}

export interface ProblemDetails {
  title?: string;
  status?: number;
  detail?: string;
  [key: string]: unknown;
}
