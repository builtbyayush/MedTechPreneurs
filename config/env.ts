import { z } from "zod";

const booleanFromString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  DATABASE_NAME: z.string().min(1, "DATABASE_NAME is required"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1, "NEXT_PUBLIC_APP_NAME is required"),
  NEXT_PUBLIC_APP_URL: z.url("NEXT_PUBLIC_APP_URL must be a valid URL"),
  NEXT_PUBLIC_ENABLE_PWA: booleanFromString,
});

type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;
export type AppEnv = ServerEnv & ClientEnv;

function formatZodErrors(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

function parseEnv<T extends z.ZodType>(
  schema: T,
  source: Record<string, string | undefined>,
  label: string,
): z.infer<T> {
  const result = schema.safeParse(source);

  if (!result.success) {
    throw new Error(
      `Invalid ${label} environment variables:\n${formatZodErrors(result.error)}`,
    );
  }

  return result.data;
}

let cachedEnv: AppEnv | null = null;

/**
 * Validated, typed environment variables.
 * Server-only — do not import from client components.
 */
export function getEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const serverEnv = parseEnv(serverSchema, process.env, "server");
  const clientEnv = parseEnv(clientSchema, process.env, "client");

  cachedEnv = { ...serverEnv, ...clientEnv };
  return cachedEnv;
}

/**
 * Safe env access for build-time or optional runtime checks.
 * Returns null when validation fails instead of throwing.
 */
export function tryGetEnv(): AppEnv | null {
  try {
    return getEnv();
  } catch {
    return null;
  }
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isPwaEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_PWA === "true";
}
