import { Skeleton } from "@/components/ui/skeleton";
import { DISCOVERY_CARD_PHOTO_ASPECT } from "@/constants/discovery";
import { cn } from "@/lib/utils";

type DiscoveryCardSkeletonProps = {
  className?: string;
};

export function DiscoveryCardSkeleton({ className }: DiscoveryCardSkeletonProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-ink-elevated shadow-founder-card",
        className,
      )}
      aria-hidden
    >
      <Skeleton className={cn("w-full rounded-none", DISCOVERY_CARD_PHOTO_ASPECT)} />
      <div className="space-y-3 px-5 py-4">
        <Skeleton className="h-7 w-2/3" />
        <div className="flex gap-1.5">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="flex gap-1.5">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <Skeleton className="h-9 w-full rounded-lg" />
        <div className="space-y-0.5 border-t border-white/[0.08] pt-3">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}
