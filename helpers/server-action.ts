import { ZodError } from "zod";

import { AppError, getErrorMessage, type ErrorCode } from "@/helpers/errors";

export type ActionSuccess<T> = {
  success: true;
  data: T;
};

export type ActionFailure = {
  success: false;
  error: string;
  code: ErrorCode;
};

export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

export function actionSuccess<T>(data: T): ActionSuccess<T> {
  return { success: true, data };
}

export function actionFailure(
  error: unknown,
  code: ErrorCode = "INTERNAL_ERROR",
): ActionFailure {
  if (error instanceof AppError) {
    return { success: false, error: error.message, code: error.code };
  }

  if (error instanceof ZodError) {
    const message = error.issues.map((issue) => issue.message).join(", ");
    return { success: false, error: message, code: "VALIDATION_ERROR" };
  }

  return { success: false, error: getErrorMessage(error), code };
}

/**
 * Wraps a server action with consistent error handling.
 * Use for all Phase 1+ server actions.
 */
export async function safeAction<T>(
  handler: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const data = await handler();
    return actionSuccess(data);
  } catch (error) {
    return actionFailure(error);
  }
}
