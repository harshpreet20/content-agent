/** PRD §25 Media Service. */

export type MediaKind = "image" | "video" | "360_asset" | "preview" | "jersey_preview";

export interface MediaAsset {
  id: string;
  kind: MediaKind;
  url: string;
  width?: number;
  height?: number;
  ownerType: "product" | "personalization" | "gallery" | "customer";
  ownerId: string;
  approved: boolean;
  createdAt: string;
}
