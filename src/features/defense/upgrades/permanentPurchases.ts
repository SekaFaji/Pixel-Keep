import type { Meta } from "../../../game/types";
import { type TownKey, META_UPGRADES, TOWN_BLDGS, saveMeta } from "../../../game/meta";

export interface PermanentPurchaseDependencies {
  metaRef: { current: Meta };
  setMeta: (meta: Meta) => void;
  setTick: (update: (tick: number) => number) => void;
  ensureAudio: () => void;
  beep: (freq: number, dur?: number, type?: OscillatorType, vol?: number) => void;
}

/** Existing permanent progression transactions, preserving local save behavior. */
export function createPermanentPurchases({
  metaRef, setMeta, setTick, ensureAudio, beep,
}: PermanentPurchaseDependencies) {
  const buyMeta = (key: keyof Omit<Meta, "gold">) => {
    const def = META_UPGRADES.find((u) => u.key === key)!;
    const lvl = metaRef.current[key];
    if (lvl >= def.costs.length) return;
    const cost = def.costs[lvl];
    if (metaRef.current.gold < cost) return;
    const m = { ...metaRef.current, gold: metaRef.current.gold - cost, [key]: lvl + 1 };
    setMeta(m);
    metaRef.current = m;
    saveMeta(m);
    ensureAudio();
    beep(880, 0.08);
    setTimeout(() => beep(1170, 0.1), 90);
  };

  /* courtyard: build or upgrade a persistent town building with meta gold */
  const buyTown = (key: TownKey) => {
    const def = TOWN_BLDGS.find((b) => b.key === key)!;
    const lvl = metaRef.current[key];
    if (lvl >= 4) return;
    const cost = def.base * Math.pow(2, lvl);
    if (metaRef.current.gold < cost) return;
    const m = { ...metaRef.current, gold: metaRef.current.gold - cost, [key]: lvl + 1 };
    setMeta(m);
    metaRef.current = m;
    saveMeta(m);
    ensureAudio();
    beep(520, 0.09, "square", 0.05);
    setTimeout(() => beep(780, 0.12, "square", 0.05), 90);
    setTick((t) => t + 1);
  };

  return { buyMeta, buyTown };
}
