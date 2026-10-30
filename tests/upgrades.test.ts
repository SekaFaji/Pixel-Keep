import { test } from "node:test";
import assert from "node:assert/strict";
import { makeGame } from "../src/game/state";
import { META_DEFAULT } from "../src/game/meta";
import { createUpgradeShop, UPGRADE_TABS, levelUpgradeCost } from "../src/features/defense/upgrades/upgradeShop";
import { createPermanentPurchases } from "../src/features/defense/upgrades/permanentPurchases";

function setup(gold = 0) {
  const game = makeGame();
  game.gold = gold;
  const gRef = { current: game };
  const metaRef = { current: { ...META_DEFAULT } };
  let redraws = 0;
  const deps = {
    gRef,
    metaRef,
    setMeta: (m: typeof META_DEFAULT) => { metaRef.current = m; },
    setTick: (cb: (n: number) => number) => { redraws = cb(redraws); },
    beep: () => {},
    ensureAudio: () => {},
  };
  return { game, metaRef, deps, redraws: () => redraws };
}

test("upgrade tabs have distinct categories", () => {
  assert.deepEqual(UPGRADE_TABS.map(t => t.key), ["bow", "turret", "archer", "worm", "castle"]);
});

test("leveled upgrade pricing is linear and never relies on UI state", () => {
  assert.equal(levelUpgradeCost(0, 50, 35), 50);
  assert.equal(levelUpgradeCost(2, 50, 35), 120);
});

test("missing gold blocks upgrades without changing any state", () => {
  const ctx = setup();
  const shop = createUpgradeShop(ctx.deps);
  const damage = shop.UP_CATALOG.find(u => u.id === "dmg");
  assert.ok(damage);
  assert.equal(damage.cost, 15);
  assert.equal(damage.buyable, false);
  damage.buy();
  assert.equal(ctx.game.damage, 3);
  assert.equal(ctx.game.gold, 0);
  assert.equal(ctx.redraws(), 0);
});

test("buying damage deducts exactly the listed price and increases strength", () => {
  const ctx = setup(100);
  const shop = createUpgradeShop(ctx.deps);
  const damage = shop.UP_CATALOG.find(u => u.id === "dmg");
  assert.ok(damage?.buyable);
  damage.buy();
  assert.equal(ctx.game.damage, 4);
  assert.equal(ctx.game.gold, 85);
  assert.equal(ctx.redraws(), 1);
});

test("locked upgrades stay locked until a supporting defensive unit exists", () => {
  const ctx = setup(1000);
  const shop = createUpgradeShop(ctx.deps);
  const turrets = shop.UP_CATALOG.find(u => u.id === "tdmg");
  assert.ok(turrets);
  assert.equal(turrets.buyable, false);
  assert.match(turrets.lockTxt ?? "", /BUILD A TURRET/);
});

test("permanent purchases reject insufficient meta gold", () => {
  const ctx = setup();
  const purchases = createPermanentPurchases(ctx.deps);
  purchases.buyMeta("walls");
  assert.equal(ctx.metaRef.current.walls, 0);
  assert.equal(ctx.metaRef.current.gold, 0);
});

test("permanent armory upgrades debit meta gold and store one level", () => {
  const ctx = setup();
  ctx.metaRef.current.gold = 100;
  const purchases = createPermanentPurchases(ctx.deps);
  purchases.buyMeta("walls");
  assert.equal(ctx.metaRef.current.walls, 1);
  assert.equal(ctx.metaRef.current.gold, 60);
});

test("permanent town purchases cannot exceed the level cap", () => {
  const ctx = setup();
  ctx.metaRef.current.gold = 999999;
  ctx.metaRef.current.townMine = 4;
  const purchases = createPermanentPurchases(ctx.deps);
  purchases.buyTown("townMine");
  assert.equal(ctx.metaRef.current.townMine, 4);
  assert.equal(ctx.metaRef.current.gold, 999999);
});
