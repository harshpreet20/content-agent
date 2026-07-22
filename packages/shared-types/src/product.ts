/** PRD §7 Product Module, §8 Personalized Jerseys, §9 Live Preview Engine. */

export type ProductStatus = "draft" | "active" | "archived";
export type ProductVisibility = "public" | "members_only" | "founders_only" | "hidden";

export interface ProductVariant {
  id: string;
  sku: string;
  color?: string;
  size?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  imageIds: string[];
}

export interface ProductCollection {
  id: string;
  slug: string;
  title: string;
  description?: string;
  productIds: string[];
  published: boolean;
  publishDate?: string;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  publishDate?: string;
  tags: string[];
  collectionIds: string[];
  variants: ProductVariant[];
  imageIds: string[];
  videoIds: string[];
  has360View: boolean;
  personalizable: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

/** PRD §8 — every customization stored separately, never overwrites originals. */
export interface JerseyPersonalization {
  id: string;
  productId: string;
  variantId: string;
  customerId: string;
  playerName?: string;
  nickname?: string;
  number?: string;
  chapter?: string;
  font?: string;
  primaryColor?: string;
  secondaryColor?: string;
  sponsorLogoMediaIds: string[];
  isCaptain: boolean;
  isViceCaptain: boolean;
  tournamentBadge?: string;
  previewImageId?: string;
  versionOf?: string;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  title?: string;
  body?: string;
  createdAt: string;
}
