/** PRD §17 Shopping Cart, §18 Abandoned Cart Automation. */

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  personalizationId?: string;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  id: string;
  customerId?: string;
  deviceId?: string;
  items: CartItem[];
  couponCode?: string;
  giftCardCode?: string;
  bundleIds: string[];
  updatedAt: string;
  abandonedAt?: string;
}
