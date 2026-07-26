import { Skeleton } from "@/components/ui/skeleton";
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
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="space-y-4 p-6">
        <Skeleton className="h-7 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Skeleton className="h-11 rounded-xl" />
          <Skeleton className="h-11 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
