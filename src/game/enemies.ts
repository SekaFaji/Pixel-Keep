import type { Enemy, Game, Kind } from "./types";

export const KIND_STATS: Record<
  Kind,
  {
    hp: number;
    speed: number;
    gold: number;
    dmg: number;
    size: number;
    px: number;
    score: number;
    reach: number;
    rx: number;
    ry: number;
    weave: number;
    wfreq: number;
    pcolor: string;
    armored: boolean;
  }
> = {
  goblin: { hp: 3, speed: 8, gold: 3, dmg: 6, size: 58, px: 5, score: 10, reach: 8, rx: 8, ry: 6.5, weave: 0, wfreq: 0, pcolor: "#4caf50", armored: false },
  orc: { hp: 8, speed: 5.5, gold: 6, dmg: 10, size: 58, px: 5, score: 25, reach: 9, rx: 8, ry: 6.5, weave: 0, wfreq: 0, pcolor: "#8d6742", armored: false },
  knight: { hp: 16, speed: 3.8, gold: 10, dmg: 16, size: 62, px: 5, score: 40, reach: 9, rx: 8.5, ry: 7, weave: 0, wfreq: 0, pcolor: "#c2c8cf", armored: false },
  wolf: { hp: 2, speed: 10.5, gold: 4, dmg: 5, size: 50, px: 5, score: 15, reach: 8, rx: 8, ry: 6, weave: 26, wfreq: 5.5, pcolor: "#9ca3af", armored: false },
  gargoyle: { hp: 5, speed: 6.5, gold: 8, dmg: 12, size: 52, px: 5, score: 35, reach: 9, rx: 8.5, ry: 7, weave: 22, wfreq: 3.5, pcolor: "#8d99ae", armored: false },
  shieldk: { hp: 22, speed: 3, gold: 14, dmg: 18, size: 62, px: 5, score: 60, reach: 9, rx: 8.5, ry: 7, weave: 0, wfreq: 0, pcolor: "#7a8698", armored: true },
  sapper: { hp: 12, speed: 2.4, gold: 16, dmg: 32, size: 58, px: 5, score: 50, reach: 9, rx: 8, ry: 6.5, weave: 0, wfreq: 0, pcolor: "#4a4a52", armored: false },
  dragon: { hp: 90, speed: 2.1, gold: 60, dmg: 40, size: 112, px: 7, score: 250, reach: 14, rx: 14.5, ry: 11.5, weave: 0, wfreq: 0, pcolor: "#d9433b", armored: false },
  swarm: { hp: 1, speed: 13, gold: 2, dmg: 3, size: 36, px: 3, score: 8, reach: 7, rx: 4.5, ry: 4, weave: 10, wfreq: 7, pcolor: "#a06cd5", armored: false },
  brute: { hp: 55, speed: 1.6, gold: 30, dmg: 30, size: 104, px: 7, score: 120, reach: 12, rx: 12, ry: 10, weave: 0, wfreq: 0, pcolor: "#6b8f3a", armored: false },
  splitter: { hp: 9, speed: 6.5, gold: 8, dmg: 8, size: 56, px: 5, score: 30, reach: 8, rx: 7.5, ry: 6, weave: 8, wfreq: 4, pcolor: "#7b4bb5", armored: false },
  crouton: { hp: 2, speed: 11, gold: 3, dmg: 4, size: 34, px: 3, score: 12, reach: 7, rx: 4.5, ry: 4, weave: 6, wfreq: 6, pcolor: "#e0b878", armored: true },
  croissant: { hp: 5, speed: 7, gold: 5, dmg: 7, size: 54, px: 5, score: 20, reach: 8, rx: 7, ry: 5.5, weave: 0, wfreq: 0, pcolor: "#e8a33d", armored: false },
  baguette: { hp: 7, speed: 9, gold: 6, dmg: 9, size: 58, px: 5, score: 25, reach: 9, rx: 9, ry: 4.5, weave: 0, wfreq: 0, pcolor: "#e0b878", armored: false },
  muffin: { hp: 20, speed: 3.2, gold: 12, dmg: 14, size: 64, px: 5, score: 45, reach: 9, rx: 8.5, ry: 7, weave: 0, wfreq: 0, pcolor: "#9c6b4f", armored: false },
  crepe: { hp: 6, speed: 5.5, gold: 7, dmg: 10, size: 50, px: 5, score: 35, reach: 8, rx: 8, ry: 5, weave: 18, wfreq: 3, pcolor: "#f4e7c7", armored: false },
  pretzel: { hp: 6, speed: 8.5, gold: 6, dmg: 8, size: 54, px: 5, score: 22, reach: 8, rx: 7, ry: 5.5, weave: 0, wfreq: 0, pcolor: "#c98f4e", armored: false },
  waffle: { hp: 24, speed: 2.8, gold: 13, dmg: 15, size: 64, px: 5, score: 48, reach: 9, rx: 8.5, ry: 7, weave: 0, wfreq: 0, pcolor: "#e0a050", armored: false },
  ram: { hp: 30, speed: 2.2, gold: 15, dmg: 22, size: 66, px: 5, score: 55, reach: 10, rx: 9.5, ry: 7, weave: 0, wfreq: 0, pcolor: "#8d6742", armored: true },
  cyclops: { hp: 18, speed: 3.5, gold: 12, dmg: 16, size: 70, px: 5, score: 50, reach: 10, rx: 9, ry: 8, weave: 0, wfreq: 0, pcolor: "#5a8f4f", armored: false },
  wyvern: { hp: 8, speed: 6.5, gold: 8, dmg: 11, size: 58, px: 5, score: 30, reach: 8, rx: 8, ry: 4.5, weave: 12, wfreq: 4, pcolor: "#4fae8f", armored: false },
  bat: { hp: 3, speed: 9, gold: 4, dmg: 6, size: 40, px: 4, score: 15, reach: 7, rx: 5.5, ry: 4, weave: 20, wfreq: 9, pcolor: "#6b5b95", armored: false },
  /* tunnelers strike from below — only earthworm turrets can reach them */
  mole: { hp: 12, speed: 4.5, gold: 10, dmg: 14, size: 56, px: 5, score: 40, reach: 30, rx: 7.5, ry: 6, weave: 0, wfreq: 0, pcolor: "#7a5230", armored: false },
  cryptworm: { hp: 26, speed: 3.0, gold: 16, dmg: 20, size: 68, px: 5, score: 70, reach: 30, rx: 10, ry: 6.5, weave: 0, wfreq: 0, pcolor: "#4e7a52", armored: false },
  croissantking: { hp: 110, speed: 2.0, gold: 90, dmg: 45, size: 120, px: 8, score: 400, reach: 14, rx: 15, ry: 11, weave: 0, wfreq: 0, pcolor: "#e8a33d", armored: false },
  crepewraith: { hp: 120, speed: 3.2, gold: 100, dmg: 40, size: 110, px: 7, score: 450, reach: 13, rx: 14, ry: 9, weave: 14, wfreq: 2.2, pcolor: "#f4e7c7", armored: false },
  muffincolossus: { hp: 150, speed: 1.8, gold: 120, dmg: 50, size: 124, px: 8, score: 500, reach: 15, rx: 15, ry: 12, weave: 0, wfreq: 0, pcolor: "#9c6b4f", armored: false },
};

/* each enemy attacks the keep on its own rhythm instead of vanishing on impact */
export const ATK_RATE: Record<Kind, number> = {
  goblin: 1.2, orc: 1.3, knight: 1.4, wolf: 0.7, gargoyle: 1.0, shieldk: 1.6,
  sapper: 2.2, dragon: 2.6, swarm: 0.6, brute: 1.8, splitter: 1.2, crouton: 0.9,
  croissant: 1.2, baguette: 1.1, muffin: 1.6, crepe: 1.2,
  croissantking: 2.4, crepewraith: 2.0, muffincolossus: 2.8,
  pretzel: 1.1, waffle: 1.5, ram: 2.0, cyclops: 1.7, wyvern: 1.0, bat: 0.8,
  mole: 1.4, cryptworm: 1.8,
};

/* bosses rotate every 5 waves: dragon → croissant king → crêpe wraith → muffin colossus */
export const BOSSES: { kind: Kind; name: string }[] = [
  { kind: "dragon", name: "DRAGON" },
  { kind: "croissantking", name: "CROISSANT KING" },
  { kind: "crepewraith", name: "CRÊPE WRAITH" },
  { kind: "muffincolossus", name: "MUFFIN COLOSSUS" },
];

/* flying enemies — the turrets' favorite prey (archers prefer the ground) */
export const isAir = (kind: Kind) =>
  kind === "dragon" || kind === "gargoyle" || kind === "crepe" || kind === "crepewraith" ||
  kind === "wyvern" || kind === "bat";
/* tunnelers — mid/late-game threats only earthworm turrets can shoot */
export const isUnder = (kind: Kind) => kind === "mole" || kind === "cryptworm";

/* manual aim: only hits an enemy actually under the crosshair */
export function enemyAt(g: Game, x: number, y: number, skip?: number[], under?: boolean): Enemy | null {
  let hit: Enemy | null = null;
  let best = Infinity;
  for (const e of g.enemies) {
    if (e.dying != null) continue;
    if (skip && skip.includes(e.id)) continue;
    /* only earthworm shots can hit tunnelers; normal arrows fly over them */
    if (under ? !isUnder(e.kind) : isUnder(e.kind)) continue;
    const st = KIND_STATS[e.kind];
    const dx = (x - e.x) / st.rx;
    const dy = (y - e.y) / st.ry;
    const d = dx * dx + dy * dy;
    if (d <= 1 && d < best) {
      best = d;
      hit = e;
    }
  }
  return hit;
}

export const pickKind = (wave: number): Kind => {
    /* new breeds: giant brute, splitting slime, tiny swarm imps */
    if (wave >= 8 && Math.random() < 0.05) return "brute";
    if (wave >= 6 && Math.random() < 0.12) return "splitter";
    if (wave >= 4 && Math.random() < 0.15) return "swarm";
    /* the Bakery Legion: croissants, baguettes, crêpes, muffins, croutons */
    if (wave >= 5 && Math.random() < 0.1) return "croissant";
    if (wave >= 6 && Math.random() < 0.1) return "baguette";
    if (wave >= 7 && Math.random() < 0.1) return "crepe";
    if (wave >= 7 && Math.random() < 0.09) return "muffin";
    if (wave >= 9 && Math.random() < 0.1) return "crouton";
    /* ground bruisers — fast pretzels & tanky waffles, the archers' prey */
    if (wave >= 6 && Math.random() < 0.1) return "pretzel";
    if (wave >= 7 && Math.random() < 0.09) return "waffle";
    /* the ground march thickens: rams & cyclops */
    if (wave >= 9 && Math.random() < 0.08) return "ram";
    if (wave >= 8 && Math.random() < 0.09) return "cyclops";
    /* the sky thickens: wyverns & bats */
    if (wave >= 6 && Math.random() < 0.09) return "wyvern";
    if (wave >= 6 && Math.random() < 0.1) return "bat";
    /* tunnelers: mid/late-game underground threats */
    if (wave >= 10 && Math.random() < 0.12) return "mole";
    if (wave >= 12 && Math.random() < 0.08) return "cryptworm";
    const roll = Math.random();
    if (wave >= 5 && roll < 0.07) return "sapper";
    if (wave >= 6 && roll < 0.22) return "shieldk";
    if (wave >= 4 && roll < 0.4) return "gargoyle";
    if (wave >= 3 && roll < 0.62) return "wolf";
    if (wave >= 3 && Math.random() < Math.min(0.2 + wave * 0.02, 0.35)) return "knight";
    if (wave >= 2 && Math.random() < 0.25) return "orc";
    return "goblin";
};

/* approach patterns: 0 = charge straight, 1 = sine sweep, 2 = curved arc, 3 = zigzag dashes */
export const pickPath = (kind: Kind): number => {
    if (
      kind === "dragon" ||
      kind === "sapper" ||
      kind === "shieldk" ||
      kind === "brute" ||
      kind === "muffin" ||
      kind === "croissantking" ||
      kind === "crepewraith" ||
      kind === "muffincolossus" ||
      kind === "waffle" ||
      kind === "ram" ||
      kind === "cyclops" ||
      kind === "mole" ||
      kind === "cryptworm"
    )
      return 0;
    if (kind === "pretzel") return Math.random() < 0.5 ? 3 : 2;
    if (kind === "wyvern") return Math.random() < 0.5 ? 1 : 2;
    if (kind === "bat") return Math.random() < 0.5 ? 3 : 1;
    if (kind === "croissant") return Math.random() < 0.5 ? 2 : Math.random() < 0.5 ? 1 : 0;
    if (kind === "baguette") return Math.random() < 0.55 ? 0 : 3;
    if (kind === "crouton") return Math.random() < 0.5 ? 3 : 1;
    const r = Math.random();
    if (r < 0.34) return 0;
    if (r < 0.58) return 1;
    if (r < 0.8) return 2;
    return 3;
};
