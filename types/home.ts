export type ProfileCompletionItem = {
  key: string;
  label: string;
  completed: boolean;
};

export type ProfileCompletionSummary = {
  percent: number;
  completedCount: number;
  totalCount: number;
  missingItems: string[];
  items: ProfileCompletionItem[];
};

export type HomeWelcome = {
  firstName: string;
  founderRoleLabel: string;
  buildingFocusLabel: string;
  currentStageLabel: string;
  companyName?: string;
};

export type HomeRecentMatch = {
  matchId: string;
  conversationId?: string;
  matchedAt: string;
  compatibilityScore: number;
  partner: {
    id: string;
    name: string;
    founderRoleLabel: string;
    profilePhotoUrl?: string;
  };
};

export type HomeUnreadMessage = {
  conversationId: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageAt: string;
  partner: {
    id: string;
    name: string;
    profilePhotoUrl?: string;
  };
};

export type HomeSuggestedFounder = {
  id: string;
  name: string;
  headline?: string;
  founderRoleLabel: string;
  companyName?: string;
  profilePhotoUrl?: string;
  compatibilityScore: number;
  compatibilityReasons: string[];
};

export type HomeActivityItem = {
  id: string;
  type: "match" | "connect" | "message" | "profile";
  message: string;
  occurredAt: string;
  href?: string;
};

export type HomeCompatibilityInsight = {
  headline: string;
  detail: string;
  topScore?: number;
};

export type HomeQuickAction = {
  label: string;
  description: string;
  href: string;
};

export type HomeDashboardData = {
  welcome: HomeWelcome;
  profileCompletion: ProfileCompletionSummary;
  compatibilityInsight: HomeCompatibilityInsight;
  recentMatches: HomeRecentMatch[];
  unreadMessages: HomeUnreadMessage[];
  suggestedFounders: HomeSuggestedFounder[];
  recentActivity: HomeActivityItem[];
  quickActions: HomeQuickAction[];
};
