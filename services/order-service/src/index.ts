import express from "express";
import cors from "cors";
import { eventBus } from "@rcc/event-bus";
import type { Order } from "@rcc/shared-types";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4008;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "order-service", status: "up" });
});

app.post("/orders", (req, res) => {
  // TODO: Place an order from a cart
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /orders" });
});

app.get("/orders/:id", (req, res) => {
  // TODO: Get an order
  res.status(501).json({ ok: false, error: "Not implemented", route: "GET /orders/:id" });
});

app.patch("/orders/:id/cancel", (req, res) => {
  // TODO: Cancel an order
  res.status(501).json({ ok: false, error: "Not implemented", route: "PATCH /orders/:id/cancel" });
});

app.post("/orders/:id/mark-paid", (req, res) => {
  // TODO: Confirm payment (called by payment-service)
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /orders/:id/mark-paid" });
});

// this service does not subscribe to any domain events yet

/** Example of how a mutation would publish a domain event once persistence is wired up:
  // eventBus.publish("OrderPlaced", payload);
  // eventBus.publish("OrderPaid", payload);
  // eventBus.publish("OrderCancelled", payload);
 */

app.listen(PORT, () => {
  console.log(`[order-service] listening on :${PORT}`);
});
