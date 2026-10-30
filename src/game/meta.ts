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
  x2gold: 0,
  secondwind: 0,
  towns: 0,
  townMine: 0,
  townBeacon: 0,
  townMoat: 0,
  townCata: 0,
  townBarracks: 0,
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
export const PERKS: { key: "speed" | "x3" | "autoshoot" | "autonext" | "x2gold" | "secondwind"; name: string; desc: string; cost: number }[] = [
  { key: "speed", name: "2× SPEED", cost: 300, desc: "Adds a 2× speed toggle button to the battlefield (bottom right)" },
  { key: "x3", name: "3× SPEED", cost: 500, desc: "Adds a 3× speed toggle next to the 2× button — for the truly impatient" },
  { key: "autoshoot", name: "AUTO SHOOT", cost: 400, desc: "Turrets & archers pick their own targets — your castle stays manual" },
  { key: "autonext", name: "AUTO NEXT", cost: 200, desc: "Cleared waves roll on automatically after a short countdown" },
  { key: "x2gold", name: "2× GOLD", cost: 3000, desc: "All run gold is doubled — kill bounties and wave bonuses alike. Forever." },
  { key: "secondwind", name: "SECOND WIND", cost: 900, desc: "Once per run, the keep survives one fatal blow at 1 HP — the walls flash gold and you fight on." },
];

/* town buildings — the persistent courtyard. Built with META gold, they
   survive every defeat and are active from wave 1 of every run.
   Level 0 = empty plot; cost of the next level is base × 2^level. */
export type TownKey = "townMine" | "townBeacon" | "townMoat" | "townCata" | "townBarracks";
export const TOWN_BLDGS: {
  key: TownKey;
  name: string;
  icon: string;
  sprite?: string;
  base: number;
  desc: string;
  fx: (lvl: number) => string;
  plot: { x: number; y: number };
}[] = [
  {
    key: "townMine",
    name: "GOLD MINE",
    icon: "⛏",
    sprite: "mine",
    base: 120,
    plot: { x: 4, y: 24 },
    desc: "Dwarves dig beside the keep — gold flows even mid-battle.",
    fx: (l) => `+${l + 1} gold every second, during every wave`,
  },
  {
    key: "townBeacon",
    name: "WATCH BEACON",
    icon: "🔥",
    sprite: "beacon",
    base: 140,
    plot: { x: 72, y: 24 },
    desc: "A signal fire on the flank rallies the whole garrison.",
    fx: (l) => `Turrets & archers fire ×${(1.1 + 0.05 * l).toFixed(2)} faster`,
  },
  {
    key: "townMoat",
    name: "MOAT",
    icon: "🌊",
    base: 160,
    plot: { x: 39, y: 56 },
    desc: "A water ring around the keep — tunnelers dig under it.",
    fx: (l) => `Enemies near the walls slowed to ${Math.round((0.7 - 0.05 * l) * 100)}% speed within ${13 + 2 * l} range`,
  },
  {
    key: "townCata",
    name: "CATAPULT",
    icon: "🎯",
    sprite: "cata",
    base: 200,
    plot: { x: 4, y: 56 },
    desc: "Lobs a boulder at the toughest foe on the field, on its own.",
    fx: (l) => `Boulder every ${8 - l}s: ${10 + 4 * l} dmg + ${5 + 2 * l} splash`,
  },
  {
    key: "townBarracks",
    name: "BARRACKS",
    icon: "⚔",
    sprite: "barracks",
    base: 170,
    plot: { x: 72, y: 56 },
    desc: "Foot soldiers by the gate sally out on their own.",
    fx: (l) => `Guard strikes every 8s for ${5 + 3 * l} dmg`,
  },
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


