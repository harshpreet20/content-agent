/** PRD §10 Membership Engine. */

export type MembershipLevel =
  | "guest"
  | "member"
  | "premium"
  | "elite"
  | "founding"
  | "admin";

export interface MembershipPermissions {
  memberPricing: boolean;
  exclusiveCollections: boolean;
  limitedDrops: boolean;
  rewardMultiplier: number;
  priorityCheckout: boolean;
  memberBundles: boolean;
}

export interface Membership {
  id: string;
  customerId: string;
  level: MembershipLevel;
  chapter?: string;
  isFoundingMember: boolean;
  permissions: MembershipPermissions;
  startedAt: string;
  expiresAt?: string;
  updatedAt: string;
}
