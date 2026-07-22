/**
 * Every app talks to backend state exclusively through service APIs
 * (PRD section 6/30) — never a direct database connection from a frontend.
 */
import type { ApiResponse, Product } from "@rcc/shared-types";

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || "http://localhost:4002";

export async function listProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${PRODUCT_SERVICE_URL}/products`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const body = (await res.json()) as ApiResponse<Product[]>;
    return body.ok && Array.isArray(body.data) ? body.data : [];
  } catch {
    // product-service unreachable, slow, or returned malformed JSON --
    // render with an empty catalogue instead of failing SSR.
    return [];
  }
}
