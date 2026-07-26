const NAME_HONORIFICS = new Set([
  "dr",
  "mr",
  "mrs",
  "ms",
  "miss",
  "prof",
  "sir",
  "dame",
]);

function normalizeNameToken(token: string): string {
  return token.replace(/[.\uFF0E\u2024]+$/g, "").toLowerCase();
}

function isHonorific(token: string): boolean {
  return NAME_HONORIFICS.has(normalizeNameToken(token));
}

function getMeaningfulNameParts(fullName: string): string[] {
  return fullName
    .trim()
    .split(/\s+/)
    .filter((part) => !isHonorific(part));
}

/** First meaningful given name, skipping titles like Dr. or Mr. */
export function getFirstName(
  fullName?: string | null,
  fallback = "founder",
): string {
  if (!fullName?.trim()) {
    return fallback;
  }

  const meaningful = getMeaningfulNameParts(fullName);
  if (meaningful.length > 0) {
    return meaningful[0];
  }

  return fullName.trim().split(/\s+/)[0] ?? fallback;
}

/** Name for dashboard greetings — avoids showing a lone honorific like "Dr." */
export function getGreetingName(
  fullName?: string | null,
  fallback = "founder",
): string {
  if (!fullName?.trim()) {
    return fallback;
  }

  const meaningful = getMeaningfulNameParts(fullName);

  if (meaningful.length >= 2) {
    return `${meaningful[0]} ${meaningful[meaningful.length - 1]}`;
  }

  if (meaningful.length === 1) {
    return meaningful[0];
  }

  return fullName.trim() || fallback;
}
