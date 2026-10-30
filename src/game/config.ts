import type { Game } from "./types";

export const CASTLE = { x: 50, y: 82 };
export const TURRET_POS = [
  { x: 33, y: 74 },
  { x: 44, y: 73 },
  { x: 56, y: 73 },
  { x: 67, y: 74 },
  { x: 27, y: 79 },
  { x: 73, y: 79 },
  { x: 21, y: 76 },
  { x: 79, y: 76 },
  { x: 15, y: 80 },
  { x: 85, y: 80 },
  { x: 39, y: 77 },
  { x: 61, y: 77 },
];
export const TURRET_CD = 1.0;

/* towers rise on the LEFT and RIGHT flanks of the keep — never on its roof.
   each built tower adds +2 turret, archer AND earthworm slots (up to 4) */
export const TOWER_SPOTS = [
  { x: 22, y: 89 },
  { x: 78, y: 89 },
  { x: 15, y: 92 },
  { x: 85, y: 92 },
];
export const MAX_TURRETS = 4;


/* ground archers flank the castle on the grass */
export const ARCHER_POS = [
  { x: 24, y: 87 },
  { x: 32, y: 89 },
  { x: 68, y: 89 },
  { x: 76, y: 87 },
  { x: 16, y: 90 },
  { x: 84, y: 90 },
  { x: 10, y: 88 },
  { x: 90, y: 88 },
  { x: 40, y: 91 },
  { x: 60, y: 91 },
  { x: 44, y: 93 },
  { x: 56, y: 93 },
];
export const ARCHER_CD = 1.15;
export const MAX_ARCHERS = 4;

/* earthworm turrets live in the dirt — only they can shoot underground enemies */
export const WORM_POS = [
  { x: 22, y: 108 },
  { x: 78, y: 108 },
  { x: 38, y: 112 },
  { x: 62, y: 112 },
  { x: 30, y: 116 },
  { x: 70, y: 116 },
  { x: 46, y: 109 },
  { x: 54, y: 109 },
  { x: 26, y: 119 },
  { x: 74, y: 119 },
];
export const WORM_CD = 1.6;
export const MAX_WORMS = 2;

/* the keep grows only when you FORTIFY it (world size) — not per level */
export const castleScaleOf = (fortLvl: number) => Math.min(1.4, 1 + 0.05 * fortLvl);

/* camera: a clearly visible zoom-out every wave, plus a bigger snap each new world.
   z = 1 shows the classic W1-1 view; smaller z = more world on screen.
   The keep itself does NOT grow per level — everything shrinking together is
   what makes the map read as getting bigger. */
export const camZoomOf = (wave: number) => {
  const world = Math.floor((wave - 1) / 5);
  const stage = ((wave - 1) % 5) + 1;
  return Math.max(0.28, Math.pow(0.75, world) * (1 - 0.05 * (stage - 1)));
};

/* smooth camera: when a new wave starts, the pull-back to that wave's view eases
   in over ZOOM_EASE seconds so the player SEES the map grow instead of it snapping.
   zoomAt = 0 means "settled" (no animation running). */
const ZOOM_EASE = 3;
export const camZoomNow = (g: Game) => {
  const target = camZoomOf(g.wave);
  if (!g.zoomAt) return target;
  const k = Math.min(1, (performance.now() / 1000 - g.zoomAt) / ZOOM_EASE);
  if (k >= 1) return target;
  const e = k * k * (3 - 2 * k); /* smoothstep */
  return g.zoomFrom + (target - g.zoomFrom) * e;
};

/* underground set dressing (world coords) — revealed as the camera pulls back */
export const ROCKS: { x: number; y: number; s: number }[] = [
  { x: -52, y: 108, s: 7 },
  { x: -30, y: 121, s: 5 },
  { x: -8, y: 102, s: 6 },
  { x: 12, y: 133, s: 8 },
  { x: 38, y: 110, s: 5 },
  { x: 60, y: 127, s: 7 },
  { x: 85, y: 104, s: 6 },
  { x: 110, y: 118, s: 8 },
  { x: 132, y: 142, s: 6 },
  { x: -45, y: 150, s: 7 },
  { x: 22, y: 160, s: 5 },
  { x: 70, y: 152, s: 6 },
  { x: 100, y: 168, s: 7 },
  { x: 128, y: 155, s: 5 },
  { x: -15, y: 175, s: 6 },
  { x: -150, y: 112, s: 6 },
  { x: -190, y: 138, s: 8 },
  { x: -230, y: 120, s: 5 },
  { x: -205, y: 165, s: 7 },
  { x: -120, y: 155, s: 5 },
  { x: 165, y: 110, s: 7 },
  { x: 205, y: 140, s: 6 },
  { x: 245, y: 118, s: 8 },
  { x: 190, y: 170, s: 5 },
  { x: 270, y: 160, s: 6 },
];
export const TUNNELS: { x: number; y: number; s: number }[] = [
  { x: 18, y: 118, s: 30 },
  { x: 50, y: 141, s: 40 },
  { x: 83, y: 126, s: 24 },
  { x: -110, y: 130, s: 26 },
  { x: 160, y: 150, s: 32 },
];
export const PINES: { x: number; px: number }[] = [
  { x: -262, px: 4 },
  { x: -240, px: 5 },
  { x: -214, px: 3 },
  { x: -190, px: 5 },
  { x: -166, px: 3 },
  { x: -142, px: 4 },
  { x: -118, px: 5 },
  { x: -96, px: 3 },
  { x: -74, px: 4 },
  { x: -54, px: 5 },
  { x: -36, px: 3 },
  { x: -20, px: 4 },
  { x: 120, px: 4 },
  { x: 136, px: 3 },
  { x: 152, px: 5 },
  { x: 174, px: 3 },
  { x: 196, px: 4 },
  { x: 218, px: 5 },
  { x: 244, px: 3 },
  { x: 266, px: 4 },
  { x: 288, px: 5 },
];
export const scaledPos = (base: { x: number; y: number }, s: number) => ({
  x: CASTLE.x + (base.x - CASTLE.x) * s,
  y: CASTLE.y + (base.y - CASTLE.y) * s,
});

/* wave numbering: worlds of 5 stages — W1-1 … W1-4, W1-BOSS, W2-1 … */
export const waveLabel = (w: number) => {
  const world = Math.floor((w - 1) / 5) + 1;
  const stage = ((w - 1) % 5) + 1;
  return "W" + world + "-" + (stage === 5 ? "BOSS" : stage);
};



