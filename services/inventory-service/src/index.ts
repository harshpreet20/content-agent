import express from "express";
import cors from "cors";
import helmet from "helmet";
import { eventBus } from "@rcc/event-bus";
import type { InventoryRecord } from "@rcc/shared-types";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const parsedPort = Number(process.env.PORT);
const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 4003;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "inventory-service", status: "up" });
});

app.get("/inventory/:productId/:variantId", (req, res) => {
  // TODO: Read stock levels
  res.status(501).json({ ok: false, error: "Not implemented", route: "GET /inventory/:productId/:variantId" });
});

app.patch("/inventory/:productId/:variantId", (req, res) => {
  // TODO: Adjust stock (Admin / warehouse feed)
  res.status(501).json({ ok: false, error: "Not implemented", route: "PATCH /inventory/:productId/:variantId" });
});

app.post("/inventory/reserve", (req, res) => {
  // TODO: Reserve stock for a pending order
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /inventory/reserve" });
});

app.post("/inventory/release", (req, res) => {
  // TODO: Release a reservation (cancelled/expired order)
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /inventory/release" });
});

eventBus.subscribe("OrderPlaced", (event) => {
  // TODO: react to OrderPlaced
  console.log("[inventory-service] received", event.name, event.eventId);
});

eventBus.subscribe("OrderCancelled", (event) => {
  // TODO: react to OrderCancelled
  console.log("[inventory-service] received", event.name, event.eventId);
});

/** Example of how a mutation would publish a domain event once persistence is wired up:
  // eventBus.publish("InventoryChanged", payload);
 */

app.listen(PORT, () => {
  console.log(`[inventory-service] listening on :${PORT}`);
});
