"use client";

import { motion } from "framer-motion";
import { Compass, RefreshCw, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { PageContainer } from "@/components/features/app/page-container";
import { SectionHeader } from "@/components/features/app/section-header";
import { DiscoveryCardSkeleton } from "@/components/features/discovery/discovery-card-skeleton";
import { DiscoveryEmptyState } from "@/components/features/discovery/discovery-empty-state";
import { DiscoverySearch } from "@/components/features/discovery/discovery-search";
import { DiscoverySwipeStack } from "@/components/features/discovery/discovery-swipe-stack";
import type { SwipeAction } from "@/components/features/discovery/discovery-swipe-card";
import {
  BlockUserButton,
  ReportProfileButton,
} from "@/components/features/safety/report-profile-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { springPress } from "@/lib/motion";
import type {
  DiscoveryFeedResponse,
  DiscoveryFounder,
} from "@/types/discovery";
import type { DiscoveryActionResult } from "@/types/match";
import { cn } from "@/lib/utils";

type FeedState = "loading" | "founder" | "empty" | "no-more" | "error";

export function DiscoverFeed() {
  const reducedMotion = usePrefersReducedMotion();
  const { toast } = useToast();
  const [feedState, setFeedState] = useState<FeedState>("loading");
  const [founder, setFounder] = useState<DiscoveryFounder | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [exitDirection, setExitDirection] = useState<SwipeAction | null>(null);
  const [restoreSignal, setRestoreSignal] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [isResettingPasses, setIsResettingPasses] = useState(false);
  const pendingActionRef = useRef<SwipeAction | null>(null);
  const pendingFounderIdRef = useRef<string | null>(null);

  const fetchFeed = useCallback(async (): Promise<DiscoveryFeedResponse | null> => {
    try {
      const response = await fetch("/api/discovery", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as
        | DiscoveryFeedResponse
        | { error?: string }
        | null;

      if (!response.ok) {
        setErrorMessage(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Unable to load founders right now.",
        );
        return null;
      }

      return payload as DiscoveryFeedResponse;
    } catch {
      setErrorMessage("Unable to load founders right now.");
      return null;
    }
  }, []);

  const applyFeed = useCallback((feed: DiscoveryFeedResponse | null) => {
    if (!feed) {
      setFeedState("error");
      setFounder(null);
      return;
    }

    if (feed.status === "founder" && feed.founder) {
      setFounder(feed.founder);
      setFeedState("founder");
      setPassedCount(0);
      return;
    }

    setFounder(null);
    setPassedCount(feed.passedCount ?? 0);
    setFeedState(feed.status === "empty" ? "empty" : "no-more");
  }, []);

  const loadFounder = useCallback(async () => {
    setFeedState("loading");
    setErrorMessage(null);
    applyFeed(await fetchFeed());
  }, [applyFeed, fetchFeed]);

  const resetPassedFounders = useCallback(async () => {
    if (isResettingPasses) {
      return;
    }

    setIsResettingPasses(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/discovery/reset-passes", {
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; resetCount?: number; error?: string }
        | null;

      if (!response.ok) {
        setErrorMessage(
          payload?.error ?? "Unable to reset passed founders right now.",
        );
        return;
      }

      const resetCount = payload?.resetCount ?? 0;
      toast({
        title: resetCount > 0 ? "Passed founders restored" : "Nothing to reset",
        description:
          resetCount > 0
            ? `${resetCount} ${resetCount === 1 ? "founder is" : "founders are"} back in your Discover feed.`
            : "You haven't passed on anyone yet.",
      });

      await loadFounder();
    } catch {
      setErrorMessage("Unable to reset passed founders right now.");
    } finally {
      setIsResettingPasses(false);
    }
  }, [isResettingPasses, loadFounder, toast]);

  useEffect(() => {
    let active = true;

    void (async () => {
      const feed = await fetchFeed();
      if (!active) {
        return;
      }
      applyFeed(feed);
    })();

    return () => {
      active = false;
    };
  }, [applyFeed, fetchFeed]);

  const beginAction = useCallback(
    (action: SwipeAction) => {
      if (!founder || isSubmitting || exitDirection) {
        return;
      }

      pendingActionRef.current = action;
      pendingFounderIdRef.current = founder.id;
      setIsSubmitting(true);
      setExitDirection(action);
    },
    [exitDirection, founder, isSubmitting],
  );

  const handleExitAnimationComplete = useCallback(async () => {
    const action = pendingActionRef.current;
    const targetUserId = pendingFounderIdRef.current;

    if (!action || !targetUserId) {
      setIsSubmitting(false);
      setExitDirection(null);
      pendingActionRef.current = null;
      return;
    }

    try {
      const response = await fetch("/api/discovery/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          action,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | (DiscoveryActionResult & { ok?: boolean; error?: string })
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ?? "We couldn't save your response. Please try again.",
        );
      }

      if (action === "connect" && payload?.matchCreated) {
        toast({
          title: "It's a match!",
          description: "You both connected. View them on your Matches tab.",
          variant: "success",
        });
      }

      setIsLoadingNext(true);
      setExitDirection(null);
      pendingActionRef.current = null;
      pendingFounderIdRef.current = null;

      const nextFeed = await fetchFeed();
      applyFeed(nextFeed);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't save your response. Please try again.";

      setRestoreSignal((value) => value + 1);
      setExitDirection(null);
      pendingActionRef.current = null;
      pendingFounderIdRef.current = null;
      setErrorMessage(message);

      toast({
        title: "Action failed",
        description: message,
        variant: "error",
      });
    } finally {
      setIsLoadingNext(false);
      setIsSubmitting(false);
    }
  }, [applyFeed, fetchFeed, toast]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (feedState !== "founder" || isSubmitting || isLoadingNext) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        beginAction("pass");
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        beginAction("connect");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [beginAction, feedState, isLoadingNext, isSubmitting]);

  return (
    <PageContainer className="pb-8 pt-2">
      <SectionHeader
        title="Discover"
        description="Swipe left to pass, right to connect — or use the buttons below."
      />

      <DiscoverySearch className="mb-5" />

      <div className="mt-4">
        {feedState === "loading" ? <DiscoveryCardSkeleton /> : null}

        {feedState === "empty" ? (
          <DiscoveryEmptyState
            icon={Users}
            title="No founders available yet"
            description="There aren't any completed founder profiles to browse right now. Check back soon as more founders join Splice+."
            actionLabel="Refresh"
            onAction={() => void loadFounder()}
          />
        ) : null}

        {feedState === "no-more" ? (
          <DiscoveryEmptyState
            icon={Compass}
            title="No more founders today"
            description={
              passedCount > 0
                ? `You've seen everyone available for now, including ${passedCount} ${
                    passedCount === 1 ? "founder you passed on" : "founders you passed on"
                  }. Reset passes to browse them again.`
                : "You've seen everyone available for now. Come back later as new founders complete onboarding."
            }
            actionLabel="Check again"
            onAction={() => void loadFounder()}
            secondaryActionLabel={
              passedCount > 0
                ? isResettingPasses
                  ? "Resetting passes…"
                  : `Reset ${passedCount} passed ${passedCount === 1 ? "founder" : "founders"}`
                : undefined
            }
            onSecondaryAction={
              passedCount > 0 ? () => void resetPassedFounders() : undefined
            }
            secondaryActionDisabled={isResettingPasses}
          />
        ) : null}

        {feedState === "error" ? (
          <DiscoveryEmptyState
            icon={RefreshCw}
            title="Discovery unavailable"
            description={
              errorMessage ??
              "Something went wrong while loading founders. Please try again."
            }
            actionLabel="Try again"
            onAction={() => void loadFounder()}
          />
        ) : null}

        {feedState === "founder" && founder ? (
          <div className="space-y-4">
            <DiscoverySwipeStack
              founder={founder}
              isLoadingNext={isLoadingNext}
              isSubmitting={isSubmitting}
              exitDirection={exitDirection}
              restoreSignal={restoreSignal}
              onAction={beginAction}
              onExitAnimationComplete={handleExitAnimationComplete}
            />

            <div
              className="grid grid-cols-2 gap-3"
              role="group"
              aria-label="Discovery actions"
            >
              <motion.div whileTap={reducedMotion ? undefined : springPress}>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.06] hover:text-white"
                  disabled={isSubmitting || isLoadingNext}
                  aria-busy={isSubmitting && exitDirection === "pass"}
                  aria-label={`Pass on ${founder.name}`}
                  onClick={() => beginAction("pass")}
                >
                  {isSubmitting && exitDirection === "pass"
                    ? "Passing…"
                    : "Pass"}
                </Button>
              </motion.div>

              <motion.div whileTap={reducedMotion ? undefined : springPress}>
                <Button
                  type="button"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "h-12 w-full bg-teal font-extrabold text-ink shadow-brutal-teal hover:bg-[#33d6d6]",
                  )}
                  disabled={isSubmitting || isLoadingNext}
                  aria-busy={isSubmitting && exitDirection === "connect"}
                  aria-label={`Connect with ${founder.name}`}
                  onClick={() => beginAction("connect")}
                >
                  {isSubmitting && exitDirection === "connect"
                    ? "Connecting…"
                    : "Connect"}
                </Button>
              </motion.div>
            </div>

            <p className="text-center text-xs text-white/40">
              Keyboard: ← pass · → connect
            </p>

            {errorMessage ? (
              <p
                className="rounded-xl border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-center gap-1 border-t border-white/10 pt-3">
              <ReportProfileButton
                reportedUserId={founder.id}
                reportedUserName={founder.name}
              />
              <BlockUserButton userName={founder.name} />
            </div>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}
