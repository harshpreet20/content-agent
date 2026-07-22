import express from "express";
import cors from "cors";
import { eventBus } from "@rcc/event-bus";
import type { Product, ProductCollection } from "@rcc/shared-types";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4002;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "product-service", status: "up" });
});

app.get("/products", (req, res) => {
  // TODO: List products (filters: collection, tag, status)
  res.status(501).json({ ok: false, error: "Not implemented", route: "GET /products" });
});

app.get("/products/:id", (req, res) => {
  // TODO: Get a single product
  res.status(501).json({ ok: false, error: "Not implemented", route: "GET /products/:id" });
});

app.post("/products", (req, res) => {
  // TODO: Create a product (Admin)
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /products" });
});

app.patch("/products/:id", (req, res) => {
  // TODO: Update a product (Admin)
  res.status(501).json({ ok: false, error: "Not implemented", route: "PATCH /products/:id" });
});

app.get("/collections", (req, res) => {
  // TODO: List collections
  res.status(501).json({ ok: false, error: "Not implemented", route: "GET /collections" });
});

app.post("/products/:id/reviews", (req, res) => {
  // TODO: Submit a product review
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /products/:id/reviews" });
});

eventBus.subscribe("InventoryChanged", (event) => {
  // TODO: react to InventoryChanged
  console.log("[product-service] received", event.name, event.eventId);
});

eventBus.subscribe("PriceChanged", (event) => {
  // TODO: react to PriceChanged
  console.log("[product-service] received", event.name, event.eventId);
});

/** Example of how a mutation would publish a domain event once persistence is wired up:
  // eventBus.publish("ProductCreated", payload);
  // eventBus.publish("ProductUpdated", payload);
  // eventBus.publish("CollectionPublished", payload);
  // eventBus.publish("ReviewCreated", payload);
 */

app.listen(PORT, () => {
  console.log(`[product-service] listening on :${PORT}`);
});
