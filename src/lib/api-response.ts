import { NextResponse } from "next/server";
import type { ApiErrorCode, ApiMeta, ApiResponse } from "@/types/api.types";

const statusByCode: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
};

export function ok<T>(data: T, meta?: ApiMeta) {
  const body: ApiResponse<T> = { success: true, data, ...(meta ? { meta } : {}) };
  return NextResponse.json(body);
}

export function fail(code: ApiErrorCode, message: string, field?: string) {
  const body: ApiResponse<null> = {
    success: false,
    data: null,
    error: { code, message, ...(field ? { field } : {}) },
  };
  return NextResponse.json(body, { status: statusByCode[code] });
}
