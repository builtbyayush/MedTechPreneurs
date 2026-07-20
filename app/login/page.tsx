import Link from "next/link";

import { SplicePlusLogo } from "@/components/features/brand/splice-plus-logo";
import { LoginForm } from "@/components/features/auth/login-form";

export const metadata = {
  title: "Log in | Splice+",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-bg-light px-4 py-10">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal">
          <SplicePlusLogo className="text-2xl" />
        </Link>
      </div>
      <LoginForm />
    </main>
  );
}
