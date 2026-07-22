/** Order/payment/shipping lifecycle. */

export type OrderStatus =
  | "pending"
  | "paid"
  | "fulfilled"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  productId: string;
  variantId: string;
  personalizationId?: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  total: number;
  currency: string;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: "razorpay" | "manual";
  status: "created" | "captured" | "failed" | "refunded";
  amount: number;
  currency: string;
  createdAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrier?: string;
  trackingNumber?: string;
  status: "pending" | "shipped" | "in_transit" | "delivered" | "returned";
  updatedAt: string;
}
