import express from "express";
import cors from "cors";
import helmet from "helmet";
import { eventBus } from "@rcc/event-bus";
import type { Cart } from "@rcc/shared-types";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const parsedPort = Number(process.env.PORT);
const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 4007;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "cart-service", status: "up" });
});

app.get("/cart/:cartId", (req, res) => {
  // TODO: Get a cart
  res.status(501).json({ ok: false, error: "Not implemented", route: "GET /cart/:cartId" });
});

app.post("/cart/:cartId/items", (req, res) => {
  // TODO: Add/update a line item
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /cart/:cartId/items" });
});

app.delete("/cart/:cartId/items/:itemId", (req, res) => {
  // TODO: Remove a line item
  res.status(501).json({ ok: false, error: "Not implemented", route: "DELETE /cart/:cartId/items/:itemId" });
});

app.post("/cart/:cartId/coupon", (req, res) => {
  // TODO: Apply a coupon code
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /cart/:cartId/coupon" });
});

eventBus.subscribe("InventoryChanged", (event) => {
  // TODO: react to InventoryChanged
  console.log("[cart-service] received", event.name, event.eventId);
});

eventBus.subscribe("PriceChanged", (event) => {
  // TODO: react to PriceChanged
  console.log("[cart-service] received", event.name, event.eventId);
});

/** Example of how a mutation would publish a domain event once persistence is wired up:
  // this service does not publish any domain events
 */

app.listen(PORT, () => {
  console.log(`[cart-service] listening on :${PORT}`);
});
