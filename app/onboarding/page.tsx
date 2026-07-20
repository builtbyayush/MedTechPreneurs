import Link from "next/link";

import { SplicePlusLogo } from "@/components/features/brand/splice-plus-logo";
import { OnboardingWizard } from "@/components/features/onboarding/onboarding-wizard";

export const metadata = {
  title: "Get started | Splice+",
};

export default function OnboardingPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-bg-light px-4 py-10">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal">
          <SplicePlusLogo className="text-2xl" />
        </Link>
        <p className="mt-2 text-sm text-deep-blue/70">
          Find your MedTech co-founder
        </p>
      </div>
      <OnboardingWizard />
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-teal hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
