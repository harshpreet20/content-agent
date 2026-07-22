import express from "express";
import cors from "cors";
import { eventBus } from "@rcc/event-bus";
import type { Customer } from "@rcc/shared-types";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4001;

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "auth-service", status: "up" });
});

app.post("/auth/signup", (req, res) => {
  // TODO: Create a customer account
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /auth/signup" });
});

app.post("/auth/login", (req, res) => {
  // TODO: Exchange credentials for a session
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /auth/login" });
});

app.post("/auth/refresh", (req, res) => {
  // TODO: Rotate an access token using a refresh token
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /auth/refresh" });
});

app.post("/auth/otp/request", (req, res) => {
  // TODO: Send an OTP to email/phone
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /auth/otp/request" });
});

app.post("/auth/otp/verify", (req, res) => {
  // TODO: Verify an OTP and issue a session
  res.status(501).json({ ok: false, error: "Not implemented", route: "POST /auth/otp/verify" });
});

app.get("/auth/session", (req, res) => {
  // TODO: Validate the current session
  res.status(501).json({ ok: false, error: "Not implemented", route: "GET /auth/session" });
});

// this service does not subscribe to any domain events yet

/** Example of how a mutation would publish a domain event once persistence is wired up:
  // eventBus.publish("CustomerCreated", payload);
  // eventBus.publish("CustomerUpdated", payload);
 */

app.listen(PORT, () => {
  console.log(`[auth-service] listening on :${PORT}`);
});
