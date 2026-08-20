"use client";

import { motion } from "framer-motion";
import { Compass, RefreshCw, RotateCcw, Search, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { PageContainer } from "@/components/features/app/page-container";
import { SectionHeader } from "@/components/features/app/section-header";
import { DiscoveryCardSkeleton } from "@/components/features/discovery/discovery-card-skeleton";
import { DiscoveryEmptyState } from "@/components/features/discovery/discovery-empty-state";
import { DiscoveryFilterOverlay } from "@/components/features/discovery/discovery-filter-overlay";
import { DiscoveryResetDialog } from "@/components/features/discovery/discovery-reset-dialog";
import { DiscoverySearchTrigger } from "@/components/features/discovery/discovery-search-trigger";
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
  DiscoveryAppliedFilters,
  DiscoveryFeedResponse,
  DiscoveryFounder,
  DiscoveryProfessionOption,
} from "@/types/discovery";
import type { DiscoveryActionResult } from "@/types/match";
import { cn } from "@/lib/utils";

type FeedState =
  | "loading"
  | "founder"
  | "empty"
  | "no-more"
  | "no-results"
  | "error";

const EMPTY_FILTERS: DiscoveryAppliedFilters = {
  query: "",
  professions: [],
};

function buildDiscoveryUrl(filters: DiscoveryAppliedFilters): string {
  const params = new URLSearchParams();
  const query = filters.query?.trim();

  if (query && query.length >= 2) {
    params.set("q", query);
  }

  for (const profession of filters.professions) {
    params.append("profession", profession);
  }

  const queryString = params.toString();
  return queryString ? `/api/discovery?${queryString}` : "/api/discovery";
}

function hasActiveFilters(filters: DiscoveryAppliedFilters): boolean {
  return (
    (filters.query?.trim().length ?? 0) >= 2 || filters.professions.length > 0
  );
}

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
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<DiscoveryAppliedFilters>(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] =
    useState<DiscoveryAppliedFilters>(EMPTY_FILTERS);
  const [professionOptions, setProfessionOptions] = useState<
    DiscoveryProfessionOption[]
  >([]);
  const pendingActionRef = useRef<SwipeAction | null>(null);
  const pendingFounderIdRef = useRef<string | null>(null);
  const appliedFiltersRef = useRef(appliedFilters);

  useEffect(() => {
    appliedFiltersRef.current = appliedFilters;
  }, [appliedFilters]);

  const fetchFeed = useCallback(
    async (
      filters: DiscoveryAppliedFilters = appliedFiltersRef.current,
    ): Promise<DiscoveryFeedResponse | null> => {
      try {
        const response = await fetch(buildDiscoveryUrl(filters), {
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as
          | DiscoveryFeedResponse
          | { error?: string; message?: string }
          | null;

        if (!response.ok) {
          setErrorMessage(
            payload && "error" in payload && payload.error
              ? payload.message ?? payload.error
              : "Unable to load founders right now.",
          );
          return null;
        }

        return payload as DiscoveryFeedResponse;
      } catch {
        setErrorMessage("Unable to load founders right now.");
        return null;
      }
    },
    [],
  );

  const applyFeed = useCallback((feed: DiscoveryFeedResponse | null) => {
    if (!feed) {
      setFeedState("error");
      setFounder(null);
      return;
    }

    if (feed.professionOptions) {
      setProfessionOptions(feed.professionOptions);
    }

    if (feed.status === "founder" && feed.founder) {
      setFounder(feed.founder);
      setFeedState("founder");
      setPassedCount(feed.passedCount ?? 0);
      return;
    }

    setFounder(null);
    setPassedCount(feed.passedCount ?? 0);
    setFeedState(
      feed.status === "empty"
        ? "empty"
        : feed.status === "no-results"
          ? "no-results"
          : "no-more",
    );
  }, []);

  const loadFounder = useCallback(
    async (filters: DiscoveryAppliedFilters = appliedFiltersRef.current) => {
      setFeedState("loading");
      setErrorMessage(null);
      applyFeed(await fetchFeed(filters));
    },
    [applyFeed, fetchFeed],
  );

  const clearFilters = useCallback(async () => {
    setAppliedFilters(EMPTY_FILTERS);
    setDraftFilters(EMPTY_FILTERS);
    appliedFiltersRef.current = EMPTY_FILTERS;
    await loadFounder(EMPTY_FILTERS);
  }, [loadFounder]);

  const applyFilters = useCallback(async () => {
    const nextFilters: DiscoveryAppliedFilters = {
      query: draftFilters.query?.trim() ?? "",
      professions: [...draftFilters.professions],
    };

    const query = nextFilters.query?.trim() ?? "";
    if (query.length > 0 && query.length < 2) {
      toast({
        title: "Search too short",
        description: "Enter at least 2 characters to search.",
        variant: "error",
      });
      return;
    }

    setIsApplyingFilters(true);
    setAppliedFilters(nextFilters);
    appliedFiltersRef.current = nextFilters;
    setOverlayOpen(false);

    try {
      await loadFounder(nextFilters);
    } finally {
      setIsApplyingFilters(false);
    }
  }, [draftFilters, loadFounder, toast]);

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
        const message =
          payload?.error ?? "Unable to reset passed founders right now.";
        setErrorMessage(message);
        toast({
          title: "Reset failed",
          description: message,
          variant: "error",
        });
        return;
      }

      const resetCount = payload?.resetCount ?? 0;
      setResetDialogOpen(false);
      toast({
        title:
          resetCount > 0 ? "Passed profiles restored" : "Nothing to restore",
        description:
          resetCount > 0
            ? `${resetCount} passed ${
                resetCount === 1 ? "profile is" : "profiles are"
              } available in Discovery again.`
            : "You haven't passed on anyone yet.",
        variant: resetCount > 0 ? "success" : "default",
      });

      await loadFounder();
    } catch {
      const message = "Unable to reset passed founders right now.";
      setErrorMessage(message);
      toast({
        title: "Reset failed",
        description: message,
        variant: "error",
      });
    } finally {
      setIsResettingPasses(false);
    }
  }, [isResettingPasses, loadFounder, toast]);

  const openResetDialog = useCallback(() => {
    setResetDialogOpen(true);
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      const feed = await fetchFeed(EMPTY_FILTERS);
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
      if (overlayOpen || resetDialogOpen) {
        return;
      }

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
  }, [
    beginAction,
    feedState,
    isLoadingNext,
    isSubmitting,
    overlayOpen,
    resetDialogOpen,
  ]);

  const filtersActive = hasActiveFilters(appliedFilters);

  return (
    <PageContainer className="relative pb-4 pt-1">
      <SectionHeader
        className="mb-2"
        title="Discover"
        description="Swipe left to pass, right to connect — or use the buttons below."
        action={
          passedCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-border bg-muted text-foreground hover:bg-muted"
              disabled={isResettingPasses || feedState === "loading"}
              onClick={openResetDialog}
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Reset passed
            </Button>
          ) : null
        }
      />

      {filtersActive ? (
        <p className="mb-2 flex items-center gap-2 text-xs text-teal">
          <Search className="size-3.5" aria-hidden />
          Search and filters are active.
        </p>
      ) : null}

      <DiscoverySearchTrigger
        active={filtersActive}
        disabled={isApplyingFilters || feedState === "loading"}
        onClick={() => {
          setDraftFilters(appliedFilters);
          setOverlayOpen(true);
        }}
      />

      <DiscoveryFilterOverlay
        open={overlayOpen}
        draftFilters={draftFilters}
        professionOptions={professionOptions}
        isApplying={isApplyingFilters}
        onDraftChange={setDraftFilters}
        onApply={() => void applyFilters()}
        onClear={() => {
          setDraftFilters(EMPTY_FILTERS);
        }}
        onClose={() => setOverlayOpen(false)}
      />

      <DiscoveryResetDialog
        open={resetDialogOpen}
        passedCount={passedCount}
        isResetting={isResettingPasses}
        onCancel={() => {
          if (!isResettingPasses) {
            setResetDialogOpen(false);
          }
        }}
        onConfirm={() => void resetPassedFounders()}
      />

      <div className="mt-2">
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

        {feedState === "no-results" ? (
          <DiscoveryEmptyState
            icon={Search}
            title="No people found"
            description="No founders match your current search and profession filters. Try broadening your search or clearing filters to return to the full Discover feed."
            actionLabel="Clear filters"
            onAction={() => void clearFilters()}
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
              passedCount > 0 ? () => openResetDialog() : undefined
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
          <div className="space-y-3">
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
                  className="h-12 w-full border-border bg-muted text-foreground hover:bg-muted hover:text-foreground"
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
                    "h-12 w-full bg-teal font-extrabold text-ink shadow-brutal-teal hover:bg-teal/80",
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

            <p className="text-center text-xs text-muted-foreground">
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

            <div className="flex flex-wrap items-center justify-center gap-1 border-t border-border pt-2">
              <ReportProfileButton
                reportedUserId={founder.id}
                reportedUserName={founder.name}
                onReported={() => void loadFounder()}
              />
              <BlockUserButton
                blockedUserId={founder.id}
                userName={founder.name}
                onBlocked={() => void loadFounder()}
              />
            </div>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}
