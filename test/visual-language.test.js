import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { ACID_SIGNAL_COLORS } from "../src/shared/acid-signal-tokens.js";

const root = new URL("../", import.meta.url);

test("portfolio and Listener share the restrained Acid Signal palette", async () => {
  assert.deepEqual(ACID_SIGNAL_COLORS, {
    void: "#070808",
    mineral: "#ebeae4",
    acid: "#d9ff32",
    scan: "#44e7ff",
    warning: "#ff3a22",
    memory: "#7557ff",
  });
  const cssFiles = await Promise.all([
    readFile(new URL("styles.css", root), "utf8"),
    readFile(new URL("projects/echo-hall/styles.css", root), "utf8"),
  ]);
  for (const css of cssFiles) {
    for (const color of Object.values(ACID_SIGNAL_COLORS)) {
      assert.ok(css.toLowerCase().includes(color), `${color} is missing from shared CSS language`);
    }
  }
});

test("light outcome ledger uses accessible dark warning ink", async () => {
  const css = await readFile(new URL("styles.css", root), "utf8");
  assert.match(
    css,
    /\.outcome-ledger strong\s*\{[^}]*color:\s*#9f1832/i,
    "outcome figures need the approved dark warning ink on the mineral background",
  );
});
