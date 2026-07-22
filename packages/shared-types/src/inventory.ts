/** PRD §5 Inventory Service. */

export interface InventoryRecord {
  productId: string;
  variantId: string;
  warehouseId: string;
  onHand: number;
  reserved: number;
  incoming: number;
  lowStockThreshold: number;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}
