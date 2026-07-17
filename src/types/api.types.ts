export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVER_ERROR";

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  cursor?: string;
}

/** The only response envelope used by Odin API route handlers. */
export interface ApiResponse<T = null> {
  success: boolean;
  data: T;
  error?: {
    code: ApiErrorCode;
    message: string;
    field?: string;
  };
  meta?: ApiMeta;
}
