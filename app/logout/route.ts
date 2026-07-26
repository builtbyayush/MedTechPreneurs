import { signOut } from "@/auth";
import { ROUTES } from "@/constants/routes";

export async function GET() {
  await signOut({ redirectTo: ROUTES.login });
}
