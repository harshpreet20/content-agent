"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { compressImage, makeThumbnail } from "./image-compress";

const BUCKET = "product-media";
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB -- Supabase Storage direct upload, not routed through a serverless function, so this isn't limited by Vercel's request body cap.
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

function randomId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export interface UploadedImage {
  url: string;
  thumbUrl: string;
}

/** Compresses to WebP (full + thumbnail) client-side, then uploads both directly to Storage. */
export async function uploadProductImage(
  supabase: SupabaseClient,
  productSlug: string,
  file: File,
): Promise<UploadedImage> {
  const [full, thumb] = await Promise.all([compressImage(file), makeThumbnail(file)]);
  const id = randomId();
  const basePath = `${productSlug || "unfiled"}/${id}`;

  const { error: fullErr } = await supabase.storage.from(BUCKET).upload(`${basePath}.webp`, full.blob, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });
  if (fullErr) throw fullErr;

  const { error: thumbErr } = await supabase.storage.from(BUCKET).upload(`${basePath}-thumb.webp`, thumb.blob, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });
  if (thumbErr) throw thumbErr;

  const { data: full_ } = supabase.storage.from(BUCKET).getPublicUrl(`${basePath}.webp`);
  const { data: thumb_ } = supabase.storage.from(BUCKET).getPublicUrl(`${basePath}-thumb.webp`);
  return { url: full_.publicUrl, thumbUrl: thumb_.publicUrl };
}

/**
 * Uploads a video as-is (no server-side transcoding -- that needs ffmpeg,
 * which doesn't fit a Vercel serverless function; see
 * services/media-service/README.md for the production path). Only
 * validates type/size client-side.
 */
export async function uploadProductVideo(
  supabase: SupabaseClient,
  productSlug: string,
  file: File,
): Promise<string> {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    throw new Error("Unsupported video format. Use MP4, WebM, or MOV.");
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("Video is larger than 100MB -- compress it before uploading.");
  }

  const id = randomId();
  const ext = file.name.split(".").pop() || "mp4";
  const path = `${productSlug || "unfiled"}/${id}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Best-effort delete; swallows errors since a missing/foreign object just means nothing to clean up. */
export async function deleteProductMedia(supabase: SupabaseClient, url: string): Promise<void> {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
}
