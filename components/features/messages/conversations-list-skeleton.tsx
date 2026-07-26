import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ConversationsListSkeletonProps = {
  className?: string;
};

export function ConversationsListSkeleton({
  className,
}: ConversationsListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} aria-hidden>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3 rounded-2xl border border-white/10 bg-ink-elevated p-4"
        >
          <Skeleton className="size-12 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
