export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "INTERNAL_ERROR"
  | "DATABASE_ERROR";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;

  constructor(message: string, code: ErrorCode = "INTERNAL_ERROR", status = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return fallback;
}

export function toHttpStatus(error: unknown): number {
  if (isAppError(error)) {
    return error.status;
  }

  return 500;
}
