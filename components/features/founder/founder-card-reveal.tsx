"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

export const FOUNDER_CARD_IMAGE = {
  src: "/images/landing/founder-card-reveal.png",
  width: 1024,
  height: 1024,
  alt: "Founder Card for Dr. Ananya Sharma with product annotations — verified credentials, compatibility score, seeking role, expertise tags, and swipe-to-decide interaction for co-founder matching.",
} as const;

export const FOUNDER_CARD_SEQUENCE = {
  card: 0,
} as const;

export const FOUNDER_CARD_HERO_WIDTH = 900;

type FounderCardRevealProps = {
  className?: string;
};

export function FounderCardReveal({ className }: FounderCardRevealProps) {
  return (
    <figure className={cn("founder-card-reveal-blend relative w-full", className)}>
      <Image
        src={FOUNDER_CARD_IMAGE.src}
        alt={FOUNDER_CARD_IMAGE.alt}
        width={FOUNDER_CARD_IMAGE.width}
        height={FOUNDER_CARD_IMAGE.height}
        className="h-auto w-full"
        sizes={`(max-width: 640px) 96vw, (max-width: 1024px) 88vw, ${FOUNDER_CARD_HERO_WIDTH}px`}
        priority={false}
      />
    </figure>
  );
}
