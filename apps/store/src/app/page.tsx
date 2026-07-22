import { listProducts } from "@/lib/api-client";

export default async function Home() {
  const products = await listProducts();

  return (
    <main style={{ padding: "3rem 1.5rem", maxWidth: 960, margin: "0 auto" }}>
      <h1>RCC Store</h1>
      <p>The storefront. Cart, checkout, personalization and limited drops, all backed by the shared cart/order/pricing/inventory services.</p>
      <p>
        Products loaded from product-service: <strong>{products.length}</strong>
      </p>
    </main>
  );
}
