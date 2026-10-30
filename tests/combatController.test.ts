import { test } from "node:test";
import assert from "node:assert/strict";
import { makeGame } from "../src/game/state";
import { META_DEFAULT } from "../src/game/meta";
import { createCombatController } from "../src/features/defense/combat/controller";
import { camZoomOf, waveLabel } from "../src/game/config";

function setup() {
  const game = makeGame();
  const gRef = { current: game };
  const metaRef = { current: { ...META_DEFAULT } };
  const pausedRef = { current: false };
  const tabRef = { current: "none" as const };
  let phase = "menu";
  let tab = "none";
  const controller = createCombatController({
    gRef,
    idRef: { current: 1 },
    metaRef,
    aspectRef: { current: 4 / 3 },
    fieldRef: { current: null },
    tabRef,
    pausedRef,
    setMeta: (next) => { metaRef.current = next; },
    setPhase: (next) => { phase = next; },
    setTab: (next) => { tab = next; },
    setDice: () => {},
    beep: () => {},
  });
  return { game, controller, pausedRef, getPhase: () => phase, getTab: () => tab };
}

test("new runs initialize with every required combat collection", () => {
  const game = makeGame();
  assert.equal(game.hp, 100);
  assert.equal(game.wave, 1);
  assert.deepEqual(game.enemies, []);
  assert.deepEqual(game.arrows, []);
  assert.deepEqual(game.crates, []);
  assert.deepEqual(game.parts, []);
  assert.deepEqual(game.coins, []);
});

test("wave startup preserves existing counts, shield restoration and UI transition", () => {
  const { game, controller, getPhase, getTab } = setup();
  game.shieldLvl = 2;
  controller.startWave(1);
  assert.equal(game.wave, 1);
  assert.equal(game.remaining, 7);
  assert.equal(game.shield, 60);
  assert.equal(getPhase(), "playing");
  assert.equal(getTab(), "none");
});

test("pausing skips the entire combat tick", () => {
  const { game, controller, pausedRef } = setup();
  game.hp = 50;
  game.repairLvl = 1;
  pausedRef.current = true;
  controller.update(12, 0.5);
  assert.equal(game.hp, 50);
});

test("boss wave begins with a boss and the existing wave labels", () => {
  const { game, controller } = setup();
  controller.startWave(5);
  assert.equal(game.wave, 5);
  assert.ok(game.enemies.some((e) => e.kind === "dragon"));
  assert.equal(waveLabel(5), "W1-BOSS");
  assert.equal(waveLabel(6), "W2-1");
  assert.ok(camZoomOf(10) < camZoomOf(1));
});
