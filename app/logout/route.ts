import { signOut } from "@/auth";
import { ROUTES } from "@/constants/routes";

const ALLOWED_REDIRECT_PREFIXES = [
  ROUTES.home,
  ROUTES.login,
  ROUTES.register,
] as const;

function resolveRedirectTo(requested: string | null): string {
  if (!requested) {
    return ROUTES.login;
  }

  try {
    // Accept absolute or relative destinations, keep only path + search.
    const url = new URL(requested, "http://localhost");
    const pathWithSearch = `${url.pathname}${url.search}`;
    const pathname = url.pathname;

    const allowed = ALLOWED_REDIRECT_PREFIXES.some((prefix) => {
      if (prefix === ROUTES.home) {
        return pathname === "/";
      }
      return pathname === prefix;
    });

    return allowed ? pathWithSearch : ROUTES.login;
  } catch {
    return ROUTES.login;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectTo = resolveRedirectTo(url.searchParams.get("to"));

  await signOut({ redirectTo });
}
