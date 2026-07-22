import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

/**
 * Reports which products still have unoptimized media: no image at all, or
 * an image/video URL that isn't hosted on the product-media Storage bucket
 * (i.e. it bypassed the compress-to-WebP upload pipeline in the product
 * editor -- most likely pasted in directly, or left over from before that
 * pipeline existed). Read-only: it never modifies anything, just prints a
 * punch list of product slugs staff should re-upload through the editor.
 *
 * Run with: npx tsx scripts/audit-media.ts
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function isOptimized(url: string): boolean {
  return url.includes("/storage/v1/object/public/product-media/") && url.endsWith(".webp");
}

async function main() {
  const { data: products, error } = await supabase
    .from("products")
    .select("slug, name, active, image, images")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load products:", error.message);
    process.exit(1);
  }

  const noImage: string[] = [];
  const unoptimized: { slug: string; url: string }[] = [];

  for (const p of products || []) {
    const images: string[] = p.images?.length ? p.images : p.image ? [p.image] : [];
    if (images.length === 0) {
      noImage.push(p.slug);
      continue;
    }
    for (const url of images) {
      if (!isOptimized(url)) unoptimized.push({ slug: p.slug, url });
    }
  }

  console.log(`Checked ${products?.length ?? 0} products.\n`);

  if (noImage.length) {
    console.log(`No photo at all (${noImage.length}):`);
    for (const slug of noImage) console.log(`  - ${slug}`);
    console.log("");
  }

  if (unoptimized.length) {
    console.log(`Not hosted on product-media / not WebP (${unoptimized.length}) -- re-upload through the product editor to compress:`);
    for (const { slug, url } of unoptimized) console.log(`  - ${slug}: ${url}`);
    console.log("");
  }

  if (!noImage.length && !unoptimized.length) {
    console.log("Every product has at least one compressed, bucket-hosted photo.");
  }
}

main();
