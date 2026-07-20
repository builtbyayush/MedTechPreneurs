import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard | Splice+",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const name = session.user.name ?? "founder";

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 bg-bg-light px-4">
      <h1 className="text-3xl font-semibold tracking-tight text-deep-blue">
        Welcome, {name}
      </h1>
      <p className="max-w-md text-center text-sm text-deep-blue/70">
        Discovery and matching come next. This is your Phase 2 placeholder
        dashboard.
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
      <Link href="/" className="text-sm text-teal hover:underline">
        Back home
      </Link>
    </main>
  );
}
