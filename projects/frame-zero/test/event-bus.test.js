import test from "node:test";
import assert from "node:assert/strict";
import { createEventBus } from "../src/core/event-bus.js";

test("event bus publishes structured payloads and supports unsubscribe", () => {
  const bus = createEventBus();
  const received = [];
  const unsubscribe = bus.on("combat:hit", (event) => received.push(event));

  bus.emit("combat:hit", { targetId: "rifleman-01", zone: "head" });
  unsubscribe();
  bus.emit("combat:hit", { targetId: "rifleman-02", zone: "torso" });

  assert.deepEqual(received, [{ targetId: "rifleman-01", zone: "head" }]);
});

test("listeners added during dispatch wait for the next event", () => {
  const bus = createEventBus();
  const received = [];
  bus.on("power:restored", () => {
    received.push("first");
    bus.on("power:restored", () => received.push("late"));
  });

  bus.emit("power:restored");
  assert.deepEqual(received, ["first"]);
});
