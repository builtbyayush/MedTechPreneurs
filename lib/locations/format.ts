export function formatLocation(
  city?: string | null,
  state?: string | null,
  country?: string | null,
): string {
  return [city, state, country].filter(Boolean).join(", ") || "Location not shared";
}
