"use client";

import Link from "next/link";
import { createElement } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Heart,
  MessageCircle,
  Sparkles,
  User,
  UserPen,
  UserPlus,
} from "lucide-react";

import { Avatar } from "@/components/features/app/avatar";
import { EmptyState } from "@/components/features/app/empty-state";
import { PageContainer } from "@/components/features/app/page-container";
import { SectionHeader } from "@/components/features/app/section-header";
import { CompatibilityScore } from "@/components/features/founder/compatibility-score";
import { CompatibilityReasons } from "@/components/features/founder/compatibility-reasons";
import { buttonVariants } from "@/components/ui/button";
import { conversationRoute, ROUTES } from "@/constants/routes";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { fadeUp, fadeUpTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type {
  HomeActivityItem,
  HomeDashboardData,
  HomeQuickAction,
  HomeRecentMatch,
  HomeSuggestedFounder,
  HomeUnreadMessage,
} from "@/types/home";

type HomeDashboardProps = {
  data: HomeDashboardData;
};

const QUICK_ACTION_ICONS = {
  discover: Compass,
  matches: Heart,
  messages: MessageCircle,
  profile: UserPen,
  toolkit: BookOpen,
} as const;

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatMatchDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(isoDate));
}

function AnimatedPercent({ value }: { value: number }) {
  return (
    <motion.span
      className="font-heading text-3xl font-black tabular-nums tracking-tight text-foreground"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {value}
    </motion.span>
  );
}

const ACTIVITY_ICONS = {
  match: Sparkles,
  connect: UserPlus,
  message: MessageCircle,
  profile: User,
} as const;

function getQuickActionIcon(action: HomeQuickAction) {
  if (action.href === ROUTES.app.discover) {
    return QUICK_ACTION_ICONS.discover;
  }
  if (action.href === ROUTES.app.matches) {
    return QUICK_ACTION_ICONS.matches;
  }
  if (action.href === ROUTES.app.messages) {
    return QUICK_ACTION_ICONS.messages;
  }
  if (action.href === ROUTES.app.toolkit) {
    return QUICK_ACTION_ICONS.toolkit;
  }
  return QUICK_ACTION_ICONS.profile;
}

export function HomeDashboard({ data }: HomeDashboardProps) {
  const reducedMotion = usePrefersReducedMotion();
  const {
    welcome,
    profileCompletion,
    compatibilityInsight,
    recentMatches,
    unreadMessages,
    suggestedFounders,
    recentActivity,
    quickActions,
  } = data;

  const startupLabel =
    welcome.companyName ??
    `${welcome.buildingFocusLabel} · ${welcome.currentStageLabel}`;

  return (
    <PageContainer className="mx-auto max-w-2xl space-y-8 pb-10">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={fadeUpTransition(reducedMotion, 0)}
        aria-labelledby="home-greeting"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
          Welcome back
        </p>
        <h1
          id="home-greeting"
          className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
        >
          {welcome.firstName}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {welcome.founderRoleLabel} · {startupLabel}
        </p>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={fadeUpTransition(reducedMotion, 0.04)}
        aria-labelledby="profile-completion-heading"
      >
        <SectionHeader
          title="Profile completion"
          description="Stronger profiles unlock better matches"
        />
        <div className="founder-card-glass rounded-2xl border border-border p-5 shadow-founder-card">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
                Progress
              </p>
              <div className="mt-1 flex items-baseline gap-1">
                <AnimatedPercent value={profileCompletion.percent} />
                <span className="font-heading text-lg font-bold text-teal/80">
                  %
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {profileCompletion.completedCount} of {profileCompletion.totalCount}{" "}
                essentials complete
              </p>
            </div>
            {profileCompletion.percent < 100 ? (
              <Link
                href={ROUTES.app.profile}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "shrink-0 border-teal/30 bg-teal/15 text-teal hover:bg-teal/25",
                )}
              >
                Complete profile
              </Link>
            ) : null}
          </div>

          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={profileCompletion.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile completion progress"
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-teal/90 to-teal/45"
              initial={{ width: reducedMotion ? `${profileCompletion.percent}%` : "0%" }}
              animate={{ width: `${profileCompletion.percent}%` }}
              transition={fadeUpTransition(reducedMotion, 0.1)}
            />
          </div>

          {profileCompletion.missingItems.length > 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Missing:{" "}
              <span className="text-muted-foreground">
                {profileCompletion.missingItems.join(", ")}
              </span>
            </p>
          ) : (
            <p className="mt-4 text-sm text-teal/85">
              Your profile is fully complete — great work.
            </p>
          )}
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={fadeUpTransition(reducedMotion, 0.08)}
        aria-labelledby="compatibility-insight-heading"
      >
        <SectionHeader
          title="Compatibility insights"
          description="Based on your founder profile"
        />
        <div className="founder-card-glass rounded-2xl border border-border p-5 shadow-founder-card">
          <p className="font-heading text-lg font-bold text-foreground">
            {compatibilityInsight.headline}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {compatibilityInsight.detail}
          </p>
          {compatibilityInsight.topScore !== undefined ? (
            <div className="mt-4 max-w-xs">
              <CompatibilityScore
                score={compatibilityInsight.topScore}
                label="Top suggestion"
              />
            </div>
          ) : null}
        </div>
      </motion.section>

      <DashboardSection
        title="Recent matches"
        description="Your latest mutual connections"
        delay={0.12}
        empty={
          recentMatches.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No matches yet"
              description="Connect with founders on Discover — when they connect back, they'll show up here."
              action={
                <Link
                  href={ROUTES.app.discover}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "border-teal/30 bg-teal/15 text-teal hover:bg-teal/25",
                  )}
                >
                  Discover founders
                </Link>
              }
            />
          ) : undefined
        }
      >
        {recentMatches.map((match, index) => (
          <RecentMatchRow key={match.matchId} match={match} index={index} />
        ))}
      </DashboardSection>

      <DashboardSection
        title="Unread messages"
        description="Conversations waiting on you"
        delay={0.16}
        empty={
          unreadMessages.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="All caught up"
              description="No unread messages right now. Your matched conversations live in Messages."
              action={
                <Link
                  href={ROUTES.app.messages}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "border-border bg-muted text-foreground hover:bg-muted",
                  )}
                >
                  Open messages
                </Link>
              }
            />
          ) : undefined
        }
      >
        {unreadMessages.map((message, index) => (
          <UnreadMessageRow key={message.conversationId} message={message} index={index} />
        ))}
      </DashboardSection>

      <DashboardSection
        title="Suggested founders"
        description="Top unseen matches for you"
        delay={0.2}
        empty={
          suggestedFounders.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No suggestions right now"
              description="You've seen everyone in the pool, or there aren't new founders yet. Check back after more join."
              action={
                <Link
                  href={ROUTES.app.discover}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "border-teal/30 bg-teal/15 text-teal hover:bg-teal/25",
                  )}
                >
                  Browse discover
                </Link>
              }
            />
          ) : undefined
        }
      >
        {suggestedFounders.map((founder, index) => (
          <SuggestedFounderRow key={founder.id} founder={founder} index={index} />
        ))}
      </DashboardSection>

      <DashboardSection
        title="Recent activity"
        description="Everything important, newest first"
        delay={0.24}
        empty={
          recentActivity.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Your story starts here"
              description="Matches, messages, and profile updates will appear as you use Splice."
              action={
                <Link
                  href={ROUTES.app.discover}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "border-teal/30 bg-teal/15 text-teal hover:bg-teal/25",
                  )}
                >
                  Start discovering
                </Link>
              }
            />
          ) : undefined
        }
      >
        {recentActivity.map((item, index) => (
          <ActivityRow key={item.id} item={item} index={index} />
        ))}
      </DashboardSection>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={fadeUpTransition(reducedMotion, 0.28)}
        aria-labelledby="quick-actions-heading"
      >
        <SectionHeader title="Quick actions" />
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = getQuickActionIcon(action);

            return (
              <motion.div
                key={action.href}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={fadeUpTransition(reducedMotion, 0.3 + index * 0.04)}
              >
                <Link
                  href={action.href}
                  className="founder-card-glass block h-full rounded-2xl border border-border p-4 shadow-founder-card transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                >
                  <div className="mb-3 inline-flex size-9 items-center justify-center rounded-xl border border-teal/20 bg-teal/10 text-teal">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <p className="font-heading text-sm font-bold text-foreground">
                    {action.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {action.description}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </PageContainer>
  );
}

type DashboardSectionProps = {
  title: string;
  description?: string;
  delay: number;
  children?: React.ReactNode;
  empty?: React.ReactNode;
};

function DashboardSection({
  title,
  description,
  delay,
  children,
  empty,
}: DashboardSectionProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={fadeUpTransition(reducedMotion, delay)}
      aria-labelledby={`${title.replace(/\s+/g, "-").toLowerCase()}-heading`}
    >
      <SectionHeader title={title} description={description} />
      {empty ?? <div className="space-y-3">{children}</div>}
    </motion.section>
  );
}

function RecentMatchRow({
  match,
  index,
}: {
  match: HomeRecentMatch;
  index: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const chatHref = match.conversationId
    ? conversationRoute(match.conversationId)
    : ROUTES.app.matches;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={fadeUpTransition(reducedMotion, 0.04 * index)}
      className="founder-card-glass rounded-2xl border border-border p-4 shadow-founder-card"
    >
      <div className="flex items-start gap-3">
        <Avatar
          name={match.partner.name}
          imageUrl={match.partner.profilePhotoUrl}
          size="lg"
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-heading text-base font-extrabold text-foreground">
                {match.partner.name}
              </h3>
              <p className="text-xs text-teal/85">{match.partner.founderRoleLabel}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-heading text-lg font-black tabular-nums text-teal">
                {match.compatibilityScore}%
              </p>
              <time
                className="text-[11px] text-muted-foreground"
                dateTime={match.matchedAt}
              >
                {formatMatchDate(match.matchedAt)}
              </time>
            </div>
          </div>
          <Link
            href={chatHref}
            className={cn(
              buttonVariants({ size: "sm" }),
              "mt-3 inline-flex items-center gap-1.5 border-border bg-muted text-foreground hover:bg-muted",
            )}
          >
            Open chat
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function UnreadMessageRow({
  message,
  index,
}: {
  message: HomeUnreadMessage;
  index: number;
}) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={fadeUpTransition(reducedMotion, 0.04 * index)}
    >
      <Link
        href={conversationRoute(message.conversationId)}
        className="founder-card-glass block rounded-2xl border border-border p-4 shadow-founder-card transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
      >
        <div className="flex items-start gap-3">
          <Avatar
            name={message.partner.name}
            imageUrl={message.partner.profilePhotoUrl}
            size="lg"
            className="shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="truncate font-heading text-base font-extrabold text-foreground">
                {message.partner.name}
              </h3>
              <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-teal px-1.5 py-0.5 text-[10px] font-bold text-ink">
                {message.unreadCount > 99 ? "99+" : message.unreadCount}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {message.lastMessage}
            </p>
            <p className="mt-2 text-xs font-medium text-teal/85">
              Continue conversation · {formatRelativeTime(message.lastMessageAt)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SuggestedFounderRow({
  founder,
  index,
}: {
  founder: HomeSuggestedFounder;
  index: number;
}) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={fadeUpTransition(reducedMotion, 0.04 * index)}
      className="founder-card-glass rounded-2xl border border-border p-4 shadow-founder-card"
    >
      <div className="flex items-start gap-3">
        <Avatar
          name={founder.name}
          imageUrl={founder.profilePhotoUrl}
          size="lg"
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-heading text-base font-extrabold text-foreground">
                {founder.name}
              </h3>
              <p className="text-xs text-teal/85">{founder.founderRoleLabel}</p>
              {founder.headline ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {founder.headline}
                </p>
              ) : null}
            </div>
            <p className="shrink-0 font-heading text-lg font-black tabular-nums text-teal">
              {founder.compatibilityScore}%
            </p>
          </div>
          {founder.compatibilityReasons.length > 0 ? (
            <CompatibilityReasons
              reasons={founder.compatibilityReasons.slice(0, 1)}
              className="mt-3"
            />
          ) : null}
          <Link
            href={ROUTES.app.discover}
            className={cn(
              buttonVariants({ size: "sm" }),
              "mt-3 inline-flex items-center gap-1.5 border-teal/30 bg-teal/10 text-teal hover:bg-teal/20",
            )}
          >
            View on Discover
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityRow({
  item,
  index,
}: {
  item: HomeActivityItem;
  index: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const content = (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted p-3">
      <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-teal/20 bg-teal/10 text-teal">
        {createElement(ACTIVITY_ICONS[item.type] ?? Sparkles, {
          className: "size-4",
          "aria-hidden": true,
        })}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{item.message}</p>
        <time className="text-xs text-muted-foreground" dateTime={item.occurredAt}>
          {formatRelativeTime(item.occurredAt)}
        </time>
      </div>
      {item.href ? (
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      ) : null}
    </div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={fadeUpTransition(reducedMotion, 0.03 * index)}
    >
      {item.href ? (
        <Link
          href={item.href}
          className="block transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal rounded-2xl"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </motion.div>
  );
}

export function HomeDashboardSkeleton() {
  return (
    <PageContainer className="mx-auto max-w-2xl space-y-8 pb-10">
      <div className="space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-full max-w-sm animate-pulse rounded bg-muted" />
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="h-32 animate-pulse rounded-2xl border border-border bg-muted" />
        </div>
      ))}
    </PageContainer>
  );
}
