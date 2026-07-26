import { SplicePlusMark } from "@/components/features/brand/splice-plus-mark";

export default function LoadingPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 bg-bg-light px-4 py-16">
      <div className="flex flex-col items-center gap-3">
        <div
          className="size-10 animate-spin rounded-full border-2 border-teal/20 border-t-teal"
          aria-hidden
        />
        <p className="text-sm font-medium text-deep-blue">
          Loading <SplicePlusMark spliceClassName="text-deep-blue" />
        </p>
      </div>
    </main>
  );
}
