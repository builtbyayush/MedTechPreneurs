"use client";

import { motion } from "framer-motion";
import { RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageContainer } from "@/components/features/app/page-container";
import { SectionHeader } from "@/components/features/app/section-header";
import { DiscoveryEmptyState } from "@/components/features/discovery/discovery-empty-state";
import { MatchFounderCard } from "@/components/features/matches/match-founder-card";
import { MatchesListSkeleton } from "@/components/features/matches/matches-list-skeleton";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { fadeUpTransition } from "@/lib/motion";
import type { MatchListItem, MatchListResponse } from "@/types/match";

type MatchesState = "loading" | "ready" | "empty" | "error";

export function MatchesFeed() {
  const reducedMotion = usePrefersReducedMotion();
  const [state, setState] = useState<MatchesState>("loading");
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadMatches = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setState("loading");
    }
    setErrorMessage(null);

    try {
      const response = await fetch("/api/matches", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as
        | MatchListResponse
        | { error?: string }
        | null;

      if (!response.ok) {
        setErrorMessage(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Unable to load matches right now.",
        );
        setState("error");
        return;
      }

      const nextMatches = (payload as MatchListResponse).matches ?? [];
      setMatches(nextMatches);
      setState(nextMatches.length > 0 ? "ready" : "empty");
    } catch {
      setErrorMessage("Unable to load matches right now.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const response = await fetch("/api/matches", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as
          | MatchListResponse
          | { error?: string }
          | null;

        if (!active) {
          return;
        }

        if (!response.ok) {
          setErrorMessage(
            payload && "error" in payload && payload.error
              ? payload.error
              : "Unable to load matches right now.",
          );
          setState("error");
          return;
        }

        const nextMatches = (payload as MatchListResponse).matches ?? [];
        setMatches(nextMatches);
        setState(nextMatches.length > 0 ? "ready" : "empty");
      } catch {
        if (!active) {
          return;
        }
        setErrorMessage("Unable to load matches right now.");
        setState("error");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <PageContainer className="pb-8 pt-2">
      <SectionHeader
        title="Matches"
        description="Founders who connected with you back. Mutual interest only."
      />

      <div className="mt-4">
        {state === "loading" ? <MatchesListSkeleton /> : null}

        {state === "empty" ? (
          <DiscoveryEmptyState
            icon={Sparkles}
            title="No matches yet"
            description="When you and another founder both connect, they'll appear here. Head to Discover to keep meeting co-founder candidates."
          />
        ) : null}

        {state === "error" ? (
          <DiscoveryEmptyState
            icon={RefreshCw}
            title="Matches unavailable"
            description={
              errorMessage ??
              "Something went wrong while loading your matches. Please try again."
            }
            actionLabel="Try again"
            onAction={() => void loadMatches(true)}
          />
        ) : null}

        {state === "ready" ? (
          <ul className="space-y-4">
            {matches.map((match, index) => (
              <motion.li
                key={match.matchId}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={fadeUpTransition(reducedMotion, index * 0.04)}
              >
                <MatchFounderCard match={match} />
              </motion.li>
            ))}
          </ul>
        ) : null}
      </div>
    </PageContainer>
  );
}
