/** PRD §5 Pricing Service — all price logic lives server-side. */

export interface PriceBreakdown {
  productId: string;
  variantId: string;
  mrp: number;
  memberPrice?: number;
  bulkPrice?: number;
  bundlePrice?: number;
  tournamentPrice?: number;
  couponPrice?: number;
  rewardPrice?: number;
  subscriptionPrice?: number;
  finalPrice: number;
  currency: string;
}

export interface PriceCalculationRequest {
  productId: string;
  variantId: string;
  customerId?: string;
  quantity: number;
  couponCode?: string;
  bundleId?: string;
}
