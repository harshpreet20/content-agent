/** PRD §11 Rewards Engine, §12 Community Achievement Engine. */

export type RewardTrigger =
  | "purchase"
  | "referral"
  | "tournament"
  | "attendance"
  | "review"
  | "birthday"
  | "renewal";

export interface RewardLedgerEntry {
  id: string;
  customerId: string;
  points: number;
  trigger: RewardTrigger;
  refId?: string;
  createdAt: string;
}

export interface RewardBalance {
  customerId: string;
  points: number;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  customerId: string;
  key: string;
  title: string;
  unlockedAt: string;
  unlocks: {
    merchIds?: string[];
    couponCodes?: string[];
    badgeKeys?: string[];
    profileTitle?: string;
  };
}

export interface LeaderboardEntry {
  customerId: string;
  displayName: string;
  points: number;
  rank: number;
}
