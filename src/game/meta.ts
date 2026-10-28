import type { Meta } from "./types";

export const META_DEFAULT: Meta = {
  gold: 0,
  rubies: 0,
  walls: 0,
  fletcher: 0,
  chest: 0,
  engineer: 0,
  longbow: 0,
  eagle: 0,
  speed: 0,
  autoshoot: 0,
  autonext: 0,
  x3: 0,
};
export const META_UPGRADES: { key: keyof Omit<Meta, "gold">; name: string; desc: string; costs: number[] }[] = [
  { key: "walls", name: "REINFORCED WALLS", desc: "+25 starting castle HP", costs: [40, 80, 160, 320] },
  { key: "fletcher", name: "MASTER FLETCHER", desc: "+1 starting arrow damage", costs: [50, 100, 200, 400] },
  { key: "longbow", name: "LONGBOW", desc: "+10% starting shot range", costs: [40, 80, 160, 320] },
  { key: "eagle", name: "EAGLE EYE", desc: "+5% distance-crit chance", costs: [50, 100, 200] },
  { key: "chest", name: "WAR CHEST", desc: "+20% gold from kills", costs: [30, 60, 120] },
  { key: "engineer", name: "ENGINEER", desc: "Start every run with a free turret", costs: [100, 250, 500] },
];

/* ruby packs — the real-money part of the shop (free while we test, real price at launch) */
export const RUBY_PACKS: { rubies: number; name: string; price: string }[] = [
  { rubies: 100, name: "POUCH OF RUBIES", price: "$0.99" },
  { rubies: 550, name: "CHEST OF RUBIES", price: "$4.99" },
  { rubies: 1500, name: "VAULT OF RUBIES", price: "$9.99" },
];
/* premium perks — permanent unlocks paid in rubies (bosses drop a few) */
export const PERKS: { key: "speed" | "x3" | "autoshoot" | "autonext"; name: string; desc: string; cost: number }[] = [
  { key: "speed", name: "2× SPEED", cost: 300, desc: "Adds a 2× speed toggle button to the battlefield (bottom right)" },
  { key: "x3", name: "3× SPEED", cost: 500, desc: "Adds a 3× speed toggle next to the 2× button — for the truly impatient" },
  { key: "autoshoot", name: "AUTO SHOOT", cost: 400, desc: "Turrets & archers pick their own targets — your castle stays manual" },
  { key: "autonext", name: "AUTO NEXT", cost: 200, desc: "Cleared waves roll on automatically after a short countdown" },
];

export function loadMeta(): Meta {
  try {
    const m = JSON.parse(localStorage.getItem("pixelkeep-meta") || "null");
    if (m && typeof m.gold === "number") return { ...META_DEFAULT, ...m };
  } catch {
    /* ignore */
  }
  return { ...META_DEFAULT };
}
export function saveMeta(m: Meta) {
  try {
    localStorage.setItem("pixelkeep-meta", JSON.stringify(m));
  } catch {
    /* ignore */
  }
}
