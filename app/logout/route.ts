import { signOut } from "@/auth";
import { ROUTES } from "@/constants/routes";

const ALLOWED_REDIRECTS = new Set<string>([
  ROUTES.home,
  ROUTES.login,
  ROUTES.register,
]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = url.searchParams.get("to");
  const redirectTo =
    requested && ALLOWED_REDIRECTS.has(requested) ? requested : ROUTES.login;

  await signOut({ redirectTo });
}
