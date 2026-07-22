import express from "express";
import cors from "cors";
import { eventBus } from "@rcc/event-bus";
import type { Shipment } from "@rcc/shared-types";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4010;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "shipping-service", status: "up" });
});

app.post("/shipping", (req, res) => {
  // TODO: Create a shipment for a paid order
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /shipping" });
});

app.get("/shipping/:orderId", (req, res) => {
  // TODO: Get shipment/tracking status
  res.status(501).json({ ok: false, error: "Not implemented", route: "GET /shipping/:orderId" });
});

eventBus.subscribe("OrderPaid", (event) => {
  // TODO: react to OrderPaid
  console.log("[shipping-service] received", event.name, event.eventId);
});

/** Example of how a mutation would publish a domain event once persistence is wired up:
  // this service does not publish any domain events
 */

app.listen(PORT, () => {
  console.log(`[shipping-service] listening on :${PORT}`);
});
