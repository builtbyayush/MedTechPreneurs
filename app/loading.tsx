import { SplicePlusMark } from "@/components/features/brand/splice-plus-mark";

export default function LoadingPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 bg-background px-4 py-16">
      <div className="flex flex-col items-center gap-3">
        <div
          className="size-10 animate-spin rounded-full border-2 border-teal/20 border-t-teal"
          aria-hidden
        />
        <p className="text-sm font-medium text-foreground">
          Loading <SplicePlusMark spliceClassName="text-foreground" />
        </p>
      </div>
    </main>
  );
}
