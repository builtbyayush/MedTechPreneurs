import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ChatThreadSkeletonProps = {
  className?: string;
};

export function ChatThreadSkeleton({ className }: ChatThreadSkeletonProps) {
  return (
    <div className={cn("flex flex-1 flex-col gap-3 px-4 py-4", className)} aria-hidden>
      <div className="flex justify-start">
        <Skeleton className="h-14 w-[72%] rounded-2xl rounded-bl-md" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-12 w-[64%] rounded-2xl rounded-br-md" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="h-16 w-[78%] rounded-2xl rounded-bl-md" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-[55%] rounded-2xl rounded-br-md" />
      </div>
    </div>
  );
}
