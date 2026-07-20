"use client";

import { LandingNav } from "@/components/features/landing/landing-nav";
import { SceneOneProposition } from "@/components/features/landing/scene-one-proposition";
import { SceneFourFounderCard } from "@/components/features/landing/scene-four-founder-card";
import { SceneThreeAssembly } from "@/components/features/landing/scene-three-assembly";
import { SceneTwoFracture } from "@/components/features/landing/scene-two-fracture";

export function LandingPage() {
  return (
    <div className="min-h-full bg-ink text-white">
      <a
        href="#scene-one-heading"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-ink focus:outline-none"
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
