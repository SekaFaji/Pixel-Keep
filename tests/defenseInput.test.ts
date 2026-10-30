import { test } from "node:test";
import assert from "node:assert/strict";
import { fieldPointToWorld, pointerToFieldPercent, createDefenseInputHandlers } from "../src/features/defense/input/defenseInput";
import { makeGame } from "../src/game/state";

test("pointer position respects field offset and size", () => {
  const p = pointerToFieldPercent(250, 170, { left: 100, top: 20, width: 300, height: 300 });
  assert.deepEqual(p, { x: 50, y: 50 });
});

test("the screen center remains the world center at every zoom", () => {
  for (const zoom of [1, 0.75, 0.5, 0.28]) {
    const world = fieldPointToWorld(50, 50, zoom);
    assert.ok(Math.abs(world.x - 50) < 1e-10);
    assert.ok(Math.abs(world.y - 50) < 1e-10);
  }
});

test("pointer coordinates round-trip through the zoom transform", () => {
  const zoom = 0.5;
  assert.deepEqual(fieldPointToWorld(25, 75, zoom), { x: 0, y: 100 });
});

test("aiming starts only while playing and ends on release", () => {
  const game = makeGame();
  const gameRef = { current: game };
  const fieldRef = {
    current: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) } as HTMLDivElement,
  };
  let redraws = 0;
  const setTick = (fn: (n: number) => number) => { redraws = fn(redraws); };
  const event = { clientX: 50, clientY: 60, preventDefault() {} } as React.PointerEvent;
  const menu = createDefenseInputHandlers({ phase: "menu", gRef: gameRef, fieldRef, setTick });
  menu.onFieldDown(event);
  assert.equal(game.hold, null);
  const play = createDefenseInputHandlers({ phase: "playing", gRef: gameRef, fieldRef, setTick });
  play.onFieldDown(event);
  assert.deepEqual(game.hold, { x: 50, y: 60 });
  assert.equal(game.holdCd, 0);
  play.onFieldMove({ ...event, clientX: 75 } as React.PointerEvent);
  assert.deepEqual(game.hold, { x: 75, y: 60 });
  play.endHold();
  assert.equal(game.hold, null);
  assert.equal(redraws, 2);
});
