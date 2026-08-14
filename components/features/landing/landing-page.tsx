"use client";

import { LandingNav } from "@/components/features/landing/landing-nav";
import { SceneOneProposition } from "@/components/features/landing/scene-one-proposition";
import { SceneFourFounderCard } from "@/components/features/landing/scene-four-founder-card";
import { SceneThreeAssembly } from "@/components/features/landing/scene-three-assembly";
import { SceneTwoFracture } from "@/components/features/landing/scene-two-fracture";

export function LandingPage() {
  return (
    <div className="min-h-full bg-background text-foreground">
      <a
        href="#scene-one-heading"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-foreground focus:outline-none focus:ring-2 focus:ring-teal"
      >
        Skip to main content
      </a>
      <LandingNav />
      <main>
        <SceneOneProposition />
        <SceneTwoFracture />
        <SceneThreeAssembly />
        <SceneFourFounderCard />
      </main>
    </div>
  );
}
