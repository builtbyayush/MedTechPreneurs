import { COMPATIBILITY_FACTOR_LABELS } from "@/lib/compatibility/weights";

export function CompatibilityExplainer() {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-white/65">
      <p>
        Compatibility is calculated dynamically from your onboarding profile and
        each founder you browse or match with. Scores are not stored in the
        database yet, so updates to your role, stage, or preferences show up
        immediately.
      </p>
      <ul className="space-y-2">
        {Object.values(COMPATIBILITY_FACTOR_LABELS).map((label) => (
          <li key={label} className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-teal/70" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
      <p className="text-white/45">
        The score reflects weighted overlap across these factors — not AI
        predictions or swipe history.
      </p>
    </div>
  );
}
