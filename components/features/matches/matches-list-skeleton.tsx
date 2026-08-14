import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type MatchesListSkeletonProps = {
  className?: string;
};

export function MatchesListSkeleton({ className }: MatchesListSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)} aria-hidden>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:p-5"
        >
          <Skeleton className="mx-auto size-24 shrink-0 rounded-2xl sm:mx-0 sm:size-28" />
          <div className="flex-1 space-y-3">
            <Skeleton className="mx-auto h-6 w-40 sm:mx-0" />
            <Skeleton className="mx-auto h-4 w-full max-w-md sm:mx-0" />
            <div className="flex justify-center gap-2 sm:justify-start">
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
            <Skeleton className="mx-auto h-4 w-32 sm:mx-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
