import { Avatar } from "@/components/features/app/avatar";
import { FOUNDER_ROLE_LABELS } from "@/types/onboarding";
import type { OutgoingConnectListItem } from "@/types/match";
import { cn } from "@/lib/utils";

type OutgoingConnectRowProps = {
  connect: OutgoingConnectListItem;
  className?: string;
};

function formatConnectDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

const STATUS_COPY = {
  matched: {
    label: "Connected back",
    className: "border-teal/25 bg-teal/10 text-teal",
  },
  pending: {
    label: "Waiting for them",
    className: "border-white/15 bg-white/[0.04] text-white/65",
  },
} as const;

export function OutgoingConnectRow({ connect, className }: OutgoingConnectRowProps) {
  const status = STATUS_COPY[connect.status];
  const { partner } = connect;

  return (
    <article
      className={cn(
        "founder-card-glass flex items-start gap-3 rounded-2xl border border-white/10 p-4 shadow-founder-card",
        className,
      )}
      aria-label={`Connection with ${partner.name}`}
    >
      <Avatar
        name={partner.name}
        imageUrl={partner.profilePhotoUrl}
        size="lg"
        className="shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-heading text-base font-extrabold text-white">
              {partner.name}
            </h3>
            <p className="text-xs text-teal/85">
              {FOUNDER_ROLE_LABELS[partner.founderRole]}
            </p>
            {partner.headline ? (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/55">
                {partner.headline}
              </p>
            ) : null}
          </div>

          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase",
              status.className,
            )}
          >
            {status.label}
          </span>
        </div>

        <p className="mt-2 text-[11px] text-white/45">
          You connected on {formatConnectDate(connect.connectedAt)}
          {connect.status === "matched" && connect.matchedAt
            ? ` · Matched ${formatConnectDate(connect.matchedAt)}`
            : null}
        </p>
      </div>
    </article>
  );
}
