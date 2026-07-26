import type { FounderRole } from "@/types/onboarding";

export type MatchStatus = "pending" | "matched" | "archived";

export type MatchPartner = {
  id: string;
  name: string;
  headline?: string;
  founderRole: FounderRole;
  companyName?: string;
  location: string;
  profilePhotoUrl?: string;
};

export type MatchListItem = {
  matchId: string;
  matchedAt: string;
  compatibilityScore: number;
  compatibilityExplanation: string;
  compatibilityReasons: string[];
  partner: MatchPartner;
};

export type MatchListResponse = {
  matches: MatchListItem[];
};

export type DiscoveryActionResult = {
  action: "pass" | "connect";
  matchCreated: boolean;
  matchId?: string;
};
