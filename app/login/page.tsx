import { Suspense } from "react";

import { LoginForm } from "@/components/features/auth/login-form";

export const metadata = {
  title: "Log in",
};

function LoginFallback() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-background">
      <div
        className="size-10 animate-spin rounded-full border-2 border-teal/20 border-t-teal"
        aria-label="Loading sign in"
      />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
