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

export type OutgoingConnectStatus = "matched" | "pending";

export type OutgoingConnectListItem = {
  targetUserId: string;
  connectedAt: string;
  status: OutgoingConnectStatus;
  matchId?: string;
  matchedAt?: string;
  /** True when the viewer already sent their one pre-match introduction. */
  introSent?: boolean;
  introSentAt?: string;
  introPreview?: string;
  partner: MatchPartner;
};

export type MatchListResponse = {
  matches: MatchListItem[];
  outgoingConnects: OutgoingConnectListItem[];
};

export type DiscoveryActionResult = {
  action: "pass" | "connect";
  matchCreated: boolean;
  matchId?: string;
};
