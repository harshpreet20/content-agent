/** PRD §16 Subscription Engine. */

export type SubscriptionInterval = "monthly" | "quarterly" | "yearly";
export type SubscriptionStatus = "active" | "paused" | "cancelled" | "past_due";

export interface Subscription {
  id: string;
  customerId: string;
  productId: string;
  variantId: string;
  interval: SubscriptionInterval;
  status: SubscriptionStatus;
  nextBillingDate: string;
  createdAt: string;
  updatedAt: string;
}
