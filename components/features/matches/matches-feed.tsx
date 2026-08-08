"use client";

import { motion } from "framer-motion";
import { RefreshCw, Sparkles, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageContainer } from "@/components/features/app/page-container";
import { SectionHeader } from "@/components/features/app/section-header";
import { DiscoveryEmptyState } from "@/components/features/discovery/discovery-empty-state";
import { MatchFounderCard } from "@/components/features/matches/match-founder-card";
import { MatchesListSkeleton } from "@/components/features/matches/matches-list-skeleton";
import { OutgoingConnectRow } from "@/components/features/matches/outgoing-connect-row";
import { useAuthSession } from "@/hooks/use-auth-session";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { fadeUpTransition } from "@/lib/motion";
import { getFirstName } from "@/lib/user/display-name";
import type {
  MatchListItem,
  MatchListResponse,
  OutgoingConnectListItem,
} from "@/types/match";

type MatchesState = "loading" | "ready" | "error";

function applyMatchesPayload(payload: MatchListResponse) {
  return {
    matches: payload.matches ?? [],
    outgoingConnects: payload.outgoingConnects ?? [],
  };
}

export function MatchesFeed() {
  const reducedMotion = usePrefersReducedMotion();
  const { user } = useAuthSession();
  const viewerFirstName = getFirstName(user?.name, "there");
  const [state, setState] = useState<MatchesState>("loading");
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [outgoingConnects, setOutgoingConnects] = useState<
    OutgoingConnectListItem[]
  >([]);
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

      const next = applyMatchesPayload(payload as MatchListResponse);
      setMatches(next.matches);
      setOutgoingConnects(next.outgoingConnects);
      setState("ready");
    } catch {
      setErrorMessage("Unable to load matches right now.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    void loadMatches(true);
  }, [loadMatches]);

  function handleIntroSent(
    targetUserId: string,
    payload: { introPreview: string; introSentAt: string },
  ) {
    setOutgoingConnects((current) =>
      current.map((connect) =>
        connect.targetUserId === targetUserId
          ? {
              ...connect,
              introSent: true,
              introSentAt: payload.introSentAt,
              introPreview: payload.introPreview,
            }
          : connect,
      ),
    );
  }

  const hasOutgoingConnects = outgoingConnects.length > 0;
  const hasMatches = matches.length > 0;

  return (
    <PageContainer className="pb-8 pt-2">
      <SectionHeader
        title="Matches"
        description="Track who you've connected with and see when they connect back."
      />

      <div className="mt-4 space-y-8">
        {state === "loading" ? <MatchesListSkeleton /> : null}

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
          <>
            <section aria-labelledby="outgoing-connects-heading">
              <h2 id="outgoing-connects-heading" className="sr-only">
                People you&apos;ve connected with
              </h2>
              <SectionHeader
                title="People you've connected with"
                description={
                  hasOutgoingConnects
                    ? `${outgoingConnects.length} ${
                        outgoingConnects.length === 1 ? "person" : "people"
                      } you've chosen to connect with on Discover.`
                    : "When you swipe right on Discover, they'll appear here with their status."
                }
                className="mb-4"
              />

              {hasOutgoingConnects ? (
                <ul className="space-y-3">
                  {outgoingConnects.map((connect, index) => (
                    <motion.li
                      key={connect.targetUserId}
                      initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={fadeUpTransition(reducedMotion, index * 0.04)}
                    >
                      <OutgoingConnectRow
                        connect={connect}
                        viewerFirstName={viewerFirstName}
                        onIntroSent={handleIntroSent}
                      />
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <DiscoveryEmptyState
                  icon={UserPlus}
                  title="No connections yet"
                  description="Head to Discover and swipe right on founders you'd like to connect with."
                />
              )}
            </section>

            <section aria-labelledby="mutual-matches-heading">
              <h2 id="mutual-matches-heading" className="sr-only">
                Mutual matches
              </h2>
              <SectionHeader
                title="Mutual matches"
                description="Founders who connected with you back. Mutual interest only."
                className="mb-4"
              />

              {hasMatches ? (
                <ul className="space-y-4">
                  {matches.map((match, index) => (
                    <motion.li
                      key={match.matchId}
                      initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={fadeUpTransition(
                        reducedMotion,
                        index * 0.04,
                      )}
                    >
                      <MatchFounderCard match={match} />
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <DiscoveryEmptyState
                  icon={Sparkles}
                  title="No mutual matches yet"
                  description="When someone you've connected with connects back, they'll appear here with full profile details."
                />
              )}
            </section>
          </>
        ) : null}
      </div>
    </PageContainer>
  );
}
