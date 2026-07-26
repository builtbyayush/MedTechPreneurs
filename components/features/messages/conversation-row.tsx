import Link from "next/link";

import { Avatar } from "@/components/features/app/avatar";
import { conversationRoute } from "@/constants/routes";
import type { ConversationListItem } from "@/types/messaging";
import { cn } from "@/lib/utils";

type ConversationRowProps = {
  conversation: ConversationListItem;
  className?: string;
};

function formatConversationTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function ConversationRow({
  conversation,
  className,
}: ConversationRowProps) {
  const { partner } = conversation;

  return (
    <Link
      href={conversationRoute(conversation.id)}
      className={cn(
        "founder-card-glass block rounded-2xl border border-white/[0.12] bg-ink-elevated p-4 shadow-founder-card ring-1 ring-white/[0.06] ring-inset transition-colors hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
        className,
      )}
      aria-label={`Open conversation with ${partner.name}`}
    >
      <div className="flex items-start gap-3">
        <Avatar
          name={partner.name}
          imageUrl={partner.profilePhotoUrl}
          size="lg"
          className="shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-heading text-base font-extrabold tracking-tight text-white">
                {partner.name}
              </h3>
              {partner.headline ? (
                <p className="truncate text-xs text-teal/85">{partner.headline}</p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              <time
                className="text-[11px] text-white/45"
                dateTime={conversation.lastMessageAt}
              >
                {formatConversationTime(conversation.lastMessageAt)}
              </time>
              {conversation.unreadCount > 0 ? (
                <span
                  className="inline-flex min-w-5 items-center justify-center rounded-full bg-teal px-1.5 py-0.5 text-[10px] font-bold text-ink"
                  aria-label={`${conversation.unreadCount} unread messages`}
                >
                  {conversation.unreadCount > 99
                    ? "99+"
                    : conversation.unreadCount}
                </span>
              ) : null}
            </div>
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/60">
            {conversation.lastMessage}
          </p>
        </div>
      </div>
    </Link>
  );
}
