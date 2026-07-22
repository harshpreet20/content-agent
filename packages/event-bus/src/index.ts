import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import type { DomainEvent, EventName, EventPayloadMap } from "@rcc/shared-types";

export type EventHandler<E extends EventName> = (
  event: DomainEvent<E>,
) => void | Promise<void>;

/**
 * In-memory pub/sub matching PRD section 4/23 ("never manually sync data,
 * everything must be event-driven"). Every service imports this same
 * interface; only the transport underneath changes when a real broker
 * (Redis Streams, SQS, Kafka) replaces the EventEmitter for production.
 */
export class EventBus {
  private emitter = new EventEmitter();

  constructor() {
    // Fan-out to many services per event; default of 10 is too low.
    this.emitter.setMaxListeners(100);
  }

  publish<E extends EventName>(name: E, payload: EventPayloadMap[E]): DomainEvent<E> {
    const event: DomainEvent<E> = {
      name,
      payload,
      occurredAt: new Date().toISOString(),
      eventId: randomUUID(),
    };
    this.emitter.emit(name, event);
    return event;
  }

  subscribe<E extends EventName>(name: E, handler: EventHandler<E>): () => void {
    const wrapped = (event: DomainEvent<E>) => {
      Promise.resolve()
        .then(() => handler(event))
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error(`[event-bus] handler for ${name} failed`, err);
        });
    };
    this.emitter.on(name, wrapped);
    return () => this.emitter.off(name, wrapped);
  }
}

/** Shared singleton for same-process usage; each standalone service should
 * construct its own EventBus (or a broker-backed adapter with the same
 * shape) once it runs out-of-process. */
export const eventBus = new EventBus();

export type { DomainEvent, EventName, EventPayloadMap } from "@rcc/shared-types";
export { EVENT_NAMES } from "@rcc/shared-types";
