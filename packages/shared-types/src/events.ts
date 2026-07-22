/**
 * PRD §23 Event Bus — the canonical list of domain events every service
 * publishes/subscribes to. This is the contract; see packages/event-bus
 * for the pub/sub implementation.
 */

import type { Product, ProductCollection, ProductReview } from "./product";
import type { InventoryRecord } from "./inventory";
import type { PriceBreakdown } from "./pricing";
import type { Order } from "./order";
import type { RewardLedgerEntry } from "./rewards";
import type { Membership } from "./membership";
import type { Subscription } from "./subscription";
import type { Customer } from "./customer";
import type { MediaAsset } from "./media";

export const EVENT_NAMES = [
  "ProductCreated",
  "ProductUpdated",
  "InventoryChanged",
  "PriceChanged",
  "CollectionPublished",
  "OrderPlaced",
  "OrderPaid",
  "OrderCancelled",
  "RewardEarned",
  "RewardRedeemed",
  "MembershipUpdated",
  "SubscriptionCreated",
  "SubscriptionCancelled",
  "CustomerCreated",
  "CustomerUpdated",
  "ReviewCreated",
  "GalleryApproved",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

/** Maps each event name to the shape of its payload. Owning service in parens. */
export interface EventPayloadMap {
  ProductCreated: Product; // product-service
  ProductUpdated: Product; // product-service
  InventoryChanged: InventoryRecord; // inventory-service
  PriceChanged: PriceBreakdown; // pricing-service
  CollectionPublished: ProductCollection; // product-service
  OrderPlaced: Order; // order-service
  OrderPaid: Order; // order-service
  OrderCancelled: Order; // order-service
  RewardEarned: RewardLedgerEntry; // rewards-service
  RewardRedeemed: RewardLedgerEntry; // rewards-service
  MembershipUpdated: Membership; // membership-service
  SubscriptionCreated: Subscription; // subscription-service
  SubscriptionCancelled: Subscription; // subscription-service
  CustomerCreated: Customer; // auth-service
  CustomerUpdated: Customer; // auth-service
  ReviewCreated: ProductReview; // product-service
  GalleryApproved: MediaAsset; // media-service
}

export interface DomainEvent<E extends EventName = EventName> {
  name: E;
  payload: EventPayloadMap[E];
  occurredAt: string;
  /** Same id replayed on retry, so handlers must stay idempotent. */
  eventId: string;
}
