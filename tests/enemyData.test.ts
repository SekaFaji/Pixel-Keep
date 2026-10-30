import { test } from "node:test";
import assert from "node:assert/strict";
import { KIND_STATS, ATK_RATE, BOSSES, isAir, isUnder } from "../src/game/enemies";

test("all enemy kinds have valid health and attack definitions", () => {
  assert.deepEqual(
    Object.keys(KIND_STATS).sort(),
    Object.keys(ATK_RATE).sort(),
    "enemy stats and attack timing must cover the same kinds",
  );
  for (const [kind, stats] of Object.entries(KIND_STATS)) {
    assert.ok(stats.hp > 0, kind + " must have health");
    assert.ok(stats.speed > 0, kind + " must have speed");
    assert.ok(ATK_RATE[kind as keyof typeof ATK_RATE] > 0, kind + " must have attack timing");
  }
});

test("boss entries and unit-targeting categories remain consistent", () => {
  for (const boss of BOSSES) assert.ok(KIND_STATS[boss.kind], boss.kind);
  assert.equal(isAir("dragon"), true);
  assert.equal(isUnder("mole"), true);
  assert.equal(isUnder("goblin"), false);
});
