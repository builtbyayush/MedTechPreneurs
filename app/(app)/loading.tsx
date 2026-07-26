import { PageContainer } from "@/components/features/app/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <PageContainer className="space-y-6 pb-8">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
    </PageContainer>
  );
}
