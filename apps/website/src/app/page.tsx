import { listProducts } from "@/lib/api-client";

export default async function Home() {
  const products = await listProducts();

  return (
    <main style={{ padding: "3rem 1.5rem", maxWidth: 960, margin: "0 auto" }}>
      <h1>Racquets Club Community</h1>
      <p>The marketing website. Product showcase, collections, membership badges — all read from the shared Product/Membership/Rewards APIs, never a local database.</p>
      <p>
        Products loaded from product-service: <strong>{products.length}</strong>
      </p>
    </main>
  );
}
