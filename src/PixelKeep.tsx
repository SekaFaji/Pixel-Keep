import React, { useEffect, useRef, useState } from "react";

/* ---------------- pixel art ---------------- */
type Sprite = { rows: string[]; colors: Record<string, string> };

const SPRITES: Record<string, Sprite> = {
  goblin: {
    colors: {
      o: "#10240f",
      g: "#2f8f3a",
      G: "#5ecf5a",
      e: "#1c5a24",
      W: "#f2f7d5",
      K: "#16302a",
      m: "#1d3a1f",
      r: "#c9302c",
    },
    rows: [
      "...oooooo...",
      "..oGGGGGGo..",
      ".oGGGGGGGGo.",
      ".oGWKGGKWGo.",
      ".oGGGGGGGGo.",
      ".oGmrrrrmGo.",
      "..oGGGGGGo..",
      ".ooGGGGGGoo.",
      "oGgGrrrrGgGo",
      "oGeGrrrrGeGo",
      ".oGeGrrGeGo.",
      "..oGg..gGo..",
      "..oo....oo..",
    ],
  },
  orc: {
    colors: {
      o: "#221408",
      k: "#8a5d33",
      K: "#ab7c48",
      e: "#63421f",
      W: "#f2f7d5",
      T: "#f2f7d5",
      m: "#3a2413",
    },
    rows: [
      "..oooooooo..",
      ".oKKKKKKKKo.",
      "oKKKKKKKKKKo",
      "oKWKkKKkKWKo",
      "oKKKKKKKKKKo",
      "oKkTTmmTTkKo",
      "okKKKKKKKKko",
      "ookKKKKKKkoo",
      "okKKKeeKKKko",
      "okKKKeeKKKko",
      ".okKKKKKKko.",
      "..okk..kko..",
      "..oo....oo..",
    ],
  },
  knight: {
    colors: {
      o: "#14171c",
      s: "#c2c8cf",
      t: "#8d99ae",
      d: "#565d63",
      p: "#d9433b",
      b: "#3b5bdc",
      y: "#ffd24a",
      W: "#ffd24a",
    },
    rows: [
      "....oooo....",
      "...oppppo...",
      "..ooppppoo..",
      ".osssssssso.",
      ".osWWssWWso.",
      ".osttttttso.",
      ".osssssssso.",
      "oossssssssoo",
      "osbbybbbybso",
      "osbbybbbybso",
      "osbbybbbybso",
      ".osbbbbbbso.",
      ".ostt..ttso.",
      ".oddd..dddo.",
      ".oooo..oooo.",
    ],
  },
  wolf: {
    colors: {
      o: "#1a1414",
      G: "#9ca3af",
      g: "#6b7280",
      E: "#ffd24a",
      W: "#f2f7d5",
    },
    rows: [
      ".oo......oo.",
      ".oGo....oGo.",
      ".oGGooooGGo.",
      "oGEGGGGGGEGo",
      "oGGGGGGGGGGo",
      "oGGWooooWGGo",
      ".oGGGGGGGGo.",
      "..oGGGGGGo..",
      ".oGo...oGo..",
      ".ooo...ooo..",
    ],
  },
  gargoyle: {
    colors: {
      w: "#4a5568",
      o: "#20242b",
      s: "#8d99ae",
      E: "#ff5b4d",
    },
    rows: [
      "w..........w",
      "ww.oooooo.ww",
      "wwossssssoww",
      "..osssssso..",
      "..osEssEso..",
      "..osssssso..",
      "...osssso...",
      "...osssso...",
      "....osso....",
      "...oo..oo...",
      "...oo..oo...",
    ],
  },
  shieldk: {
    colors: {
      o: "#14171c",
      s: "#c2c8cf",
      t: "#8d99ae",
      d: "#565d63",
      h: "#7a8698",
      y: "#ffd24a",
    },
    rows: [
      "....oooo....",
      ".osssssssso.",
      ".osddssddso.",
      ".osttttttso.",
      ".osssssssso.",
      "oossssssssoo",
      "osshhhhhhsso",
      "osshhyyhhsso",
      "osshhyyhhsso",
      "osshhhhhhsso",
      "osshhhhhhsso",
      ".osssssssso.",
      ".ostt..ttso.",
      ".oddd..dddo.",
      ".oooo..oooo.",
    ],
  },
  sapper: {
    colors: {
      f: "#ffd24a",
      o: "#241608",
      b: "#26262b",
      B: "#4a4a52",
      r: "#6d4c2f",
      W: "#f2f7d5",
    },
    rows: [
      ".....ff.....",
      "....oooo....",
      "...obbbbo...",
      "..obBBbbbo..",
      "..obBBbbbo..",
      "...obbbbo...",
      "..orrrrrro..",
      ".orWrrrrWro.",
      ".orrrrrrrro.",
      "orrrrrrrrrro",
      ".orrrrrrrro.",
      "..orr..rro..",
      "..oo....oo..",
    ],
  },
  swarm: {
    colors: {
      o: "#1a0f26",
      P: "#a06cd5",
      p: "#7b4bb5",
      W: "#ffd24a",
      m: "#2a1440",
    },
    rows: [
      "o......o",
      "oo....oo",
      ".oPPPPo.",
      "oPWPPWPo",
      "oPPmmPPo",
      ".oppppo.",
      "..o..o..",
      ".oo..oo.",
    ],
  },
  splitter: {
    colors: {
      o: "#1c1030",
      P: "#b07de0",
      p: "#7b4bb5",
      E: "#ff5b4d",
    },
    rows: [
      "...oooooo...",
      "..oPPPPPPo..",
      ".oPPpPPpPPo.",
      "oPPppPPppPPo",
      "oPEPppPppEPo",
      "oPPppppppPPo",
      "oPpPPppPPpPo",
      ".oPpPPPPpPo.",
      "..oPppppPo..",
      "...oooooo...",
    ],
  },
  brute: {
    colors: {
      o: "#1c1210",
      G: "#7a9e4e",
      g: "#5a7636",
      d: "#3f5426",
      E: "#ff5b4d",
      m: "#2a1a10",
      t: "#f2f7d5",
      b: "#3a2413",
    },
    rows: [
      "....oooooo....",
      "..oGGGGGGGGo..",
      ".oGGGGGGGGGGo.",
      ".oGEEGGGGEEGo.",
      ".oGGGGGGGGGGo.",
      ".oGGmmmmmmGGo.",
      ".oGttttttttGo.",
      "..oGGGGGGGGo..",
      ".ooGGGGGGGGoo.",
      "oGgGGGGGGGGgGo",
      "oGgGGGddGGGgGo",
      "ooGGGddddGGGoo",
      ".obbbbbbbbbbo.",
      ".oddGGGGGGddo.",
      "..oddGGGGddo..",
      "..ooo....ooo..",
    ],
  },
  ram: {
    colors: {
      o: "#241408",
      G: "#8d6742",
      g: "#6a4a2a",
      W: "#4e5a66",
    },
    rows: [
      "..GGGGGGG...",
      ".GGgggggGG..",
      ".GggggggWWo.",
      ".GggggggWWo.",
      ".GGgggggGG..",
      "..GGGGGGG...",
      "..oo....oo..",
      "..oo....oo..",
    ],
  },
  cyclops: {
    colors: {
      o: "#1a2e14",
      G: "#5a8f4f",
      g: "#3f6b38",
      W: "#fff",
      E: "#d9433b",
    },
    rows: [
      "...oooooo...",
      "..oGGGGGGo..",
      ".oGGWEGGGGo.",
      ".oGGGGGGGGo.",
      ".oGggggggGo.",
      ".oGoGGGGoGo.",
      ".oGgWWWWgGo.",
      "..oGgggggGo.",
      "..oGo..oGo..",
      "..oo...oo...",
    ],
  },
  wyvern: {
    colors: {
      o: "#0a2e22",
      G: "#4fae8f",
      g: "#2f7a62",
      E: "#ffd24a",
    },
    rows: [
      "oG......Go..",
      "oGG....GGo..",
      "oGGGGGGGGo..",
      "..oGEEGGGo..",
      "..oGGGGGGo..",
      "...oGgGo....",
      "...oGgGo....",
      "....oo......",
    ],
  },
  bat: {
    colors: {
      o: "#1a1030",
      G: "#6b5b95",
      g: "#4e4270",
      E: "#ff5b4d",
    },
    rows: [
      "oG......Go",
      "oGG....GGo",
      ".oGgEEgGo.",
      ".oGGGGGGo.",
      "..og..go..",
    ],
  },
  mole: {
    colors: {
      o: "#241408",
      G: "#7a5230",
      g: "#5a3a20",
      W: "#fff",
      E: "#d9433b",
      P: "#e8a0a0",
    },
    rows: [
      "...oooooo...",
      "..oGGGGGGo..",
      ".oGWEGGWEGo.",
      ".oGggggggGo.",
      ".oGPPggPPGo.",
      "..oGPPPPGo..",
      "...oGgGGo...",
      "...oo..oo...",
    ],
  },
  cryptworm: {
    colors: {
      o: "#0e2416",
      G: "#4e7a52",
      g: "#35543a",
      W: "#fff",
      E: "#d9433b",
    },
    rows: [
      "..GG....GG..",
      ".oGGG..GGGo.",
      ".oGGGGGGGGo.",
      ".oGgWEGGGGo.",
      "..oGgGGgGo..",
      "...oo..oo...",
    ],
  },
  worm: {
    colors: {
      o: "#1a1009",
      G: "#c2543f",
      g: "#9c4030",
      W: "#fff",
      E: "#ffd24a",
    },
    rows: [
      "...oooooo...",
      "..oGGGGGGo..",
      ".oGWEGGWEGo.",
      ".oGggggggGo.",
      "..oGgoGgGo..",
      "..oooooooo..",
    ],
  },
  pretzel: {
    colors: {
      o: "#3a2410",
      G: "#c98f4e",
      g: "#a06a32",
      E: "#d9433b",
      W: "#f2e0c0",
    },
    rows: [
      "...oooooo...",
      "..oGWGGWGo..",
      ".oGgGGGGgGo.",
      ".oGEEGGEEGo.",
      ".oGoGggGoGo.",
      "..oGGGGGGo..",
      "..oGgGGgGo..",
      "...oGGGGo...",
      "...oo..oo...",
    ],
  },
  waffle: {
    colors: {
      o: "#3a2410",
      G: "#e0a050",
      g: "#c08030",
      W: "#fff",
      E: "#d9433b",
    },
    rows: [
      "...oooooo...",
      ".oGGgGGgGGo.",
      ".oGWEGGWEGo.",
      ".oGgGGGGgGo.",
      ".oGGgGGgGGo.",
      ".oGgGGGGgGo.",
      "..oGGGGGGo..",
      "...oGGGGo...",
      "...oo..oo...",
    ],
  },
  croissant: {
    colors: {
      o: "#4a2c14",
      G: "#e8a33d",
      g: "#c97f2e",
      E: "#d9433b",
    },
    rows: [
      "..o......o..",
      ".oGo....oGo.",
      ".oGGooooGGo.",
      "..oGEGGEGo..",
      "..oGGGGGGo..",
      "...oGdGGo...",
      "...oGGGGo...",
      "....oooo....",
    ],
  },
  baguette: {
    colors: {
      o: "#5a3a1a",
      G: "#e0b878",
      g: "#c99a55",
      d: "#a87838",
      E: "#d9433b",
    },
    rows: [
      "..oooooooooo..",
      ".oGGGGGGGGGGo.",
      "oGdGGGEEdGGdgo",
      ".oggggggggggo.",
      "..oooooooooo..",
    ],
  },
  crouton: {
    colors: {
      o: "#3a2810",
      G: "#e0b878",
      g: "#c99a55",
      W: "#fff",
    },
    rows: [
      "oooooooo",
      "oGGGGGGo",
      "oGWGGWGo",
      "oGggggGo",
      "oGgGGgGo",
      "oGggggGo",
      "oggggggo",
      "oooooooo",
    ],
  },
  muffin: {
    colors: {
      o: "#2a1a10",
      G: "#9c6b4f",
      g: "#7a4e35",
      W: "#fff",
      d: "#4a2c1a",
      R: "#d9433b",
      r: "#a3251d",
    },
    rows: [
      "...oooooo...",
      "..oGGGGGGo..",
      ".oGWGGGWGGo.",
      ".oGdGGGGdGo.",
      ".oggggggggo.",
      "..oRrRrRro..",
      "..oRrRrRro..",
      "..oRrRrRro..",
      "...oooooo...",
    ],
  },
  crepe: {
    colors: {
      o: "#6a6a4a",
      W: "#f4e7c7",
      w: "#d9caa0",
      E: "#d9433b",
    },
    rows: [
      "...oooooo...",
      "..oWWWWWWo..",
      ".oWWwWWwWWo.",
      "oWWEWWWWEWWo",
      "oWWWWWWWWWWo",
      ".oWWWWWWWWo.",
      ".oo.o..o.oo.",
    ],
  },
  croissantking: {
    colors: {
      o: "#4a2c14",
      G: "#e8a33d",
      E: "#d9433b",
      m: "#2a1408",
      y: "#ffd24a",
    },
    rows: [
      "......y..y......",
      ".....oyyyyo.....",
      "..oo........oo..",
      ".oGGo......oGGo.",
      ".oGGooooooooGGo.",
      "..oGGGGGGGGGGo..",
      "..oGEEGGGGEEGo..",
      "..oGGmmmmmmGGo..",
      "...oGGGGGGGGo...",
      "....oGGGGGGo....",
      "....oGGGGGGo....",
      ".....oooooo.....",
    ],
  },
  crepewraith: {
    colors: {
      o: "#6a6a4a",
      W: "#f4e7c7",
      w: "#d9caa0",
      E: "#d9433b",
    },
    rows: [
      "....oooooooo....",
      "..ooWWWWWWWWoo..",
      ".oWWWWWWWWWWWWo.",
      "oWWWWEEWWEEWWWWo",
      "oWwWWWWWWWWWWwWo",
      "oWWWWWWwwWWWWWWo",
      ".oWWwWWWWWWwWWo.",
      ".oWWWWWWWWWWWWo.",
      "..oWWWWWWWWWWo..",
      "..ooWwWWWWwWoo..",
      "...o.oo..oo.o...",
    ],
  },
  muffincolossus: {
    colors: {
      o: "#2a1a10",
      G: "#9c6b4f",
      g: "#7a4e35",
      W: "#fff",
      E: "#d9433b",
      m: "#2a1408",
      d: "#4a2c1a",
      R: "#d9433b",
      r: "#a3251d",
    },
    rows: [
      ".....oooooo.....",
      "...ooGGGGGGoo...",
      "..oGGGGGGGGGGo..",
      ".oGGdGGGGGGdGGo.",
      ".oGWEGGGGGGEWGo.",
      ".oGGGGmmmmGGGGo.",
      ".oGGGGGGGGGGGGo.",
      ".oggggggggggggo.",
      "..oRrRrRrRrRro..",
      "..oRrRrRrRrRro..",
      "..oRrRrRrRrRro..",
      "..oRrRrRrRrRro..",
      "..oRrRrRrRrRro..",
      "...oooooooooo...",
    ],
  },
  archer: {
    colors: {
      o: "#14171c",
      h: "#2f8f3a",
      E: "#14171c",
      F: "#e8b88a",
      B: "#a9854f",
      q: "#8d6742",
    },
    rows: [
      "...ooo...",
      "..ohhho..",
      ".ohhhhhoB",
      ".ohEFFhoB",
      ".ohFFFhoB",
      "..ohhhoB.",
      "..ohhhoB.",
      ".oqqhhoB.",
      ".oqqhhoB.",
      "..ohhho..",
      "..oh.ho..",
      "..oo.oo..",
    ],
  },
  coin: {
    colors: { o: "#8a5a00", W: "#fff2b8", Y: "#ffd24a", y: "#d9a423" },
    rows: [
      ".ooooo.",
      "oWWYYyo",
      "oWYYYyo",
      "oYYYYyo",
      "oYYYyyo",
      "oyyyyyo",
      ".ooooo.",
    ],
  },
  star: {
    colors: { W: "#ffd24a" },
    rows: ["...W...", "..WWW..", "WWWWWWW", ".WWWWW.", "..WWW..", ".W...W."],
  },
  dragon: {
    colors: {
      r: "#d9433b",
      R: "#e0655e",
      d: "#a3251d",
      D: "#7d1a13",
      W: "#ffd24a",
      T: "#f2f7d5",
      y: "#ffb347",
    },
    rows: [
      "rr............rr",
      "rrr..........rrr",
      "rrrr........rrrr",
      "Rrrr.dddddd.rrrR",
      "Rrrr.dddddd.rrrR",
      ".Rrr.dDDDDd.rrR.",
      "..rr.dWDDWd.rr..",
      "...r.dDDDDd.r...",
      "....ddTTTTdd....",
      "....dDDDDDDd....",
      "....dyyyyyyd....",
      "....dyyyyyyd....",
      "...dd.D..D.dd...",
      "..dd........dd..",
    ],
  },
  turret: {
    colors: {
      w: "#8d6742",
      W: "#a9854f",
      s: "#c8ccd0",
      o: "#23262b",
    },
    rows: [
      "o.......o",
      "wo.....ow",
      ".wWo.oWw.",
      "..wsssw..",
      "...WsW...",
      "....s....",
      "...www...",
      "..wwwww..",
      "....w....",
    ],
  },
  castle: {
    colors: { b: "#8d99ae", d: "#4a5568", W: "#ffd24a" },
    rows: [
      "bb...b..b...bb",
      "bb..bbbbbb..bb",
      "bb..bddddb..bb",
      "bbWbbddddbbWbb",
      "bbbbbddddbbbbb",
      "bbbbbddddbbbbb",
    ],
  },
  pine: {
    colors: { t: "#1f6b3a", T: "#5d3a1a" },
    rows: ["...t...", "..ttt..", ".ttttt.", "ttttttt", ".ttttt.", "..ttt..", "...T...", "...T..."],
  },
  moon: {
    colors: { w: "#f4f1de" },
    rows: [".wwww.", "wwwwww", "wwwwww", "wwwwww", "wwwwww", ".wwww."],
  },
};

function PixelSprite({
  sprite,
  px,
  style,
}: {
  sprite: Sprite;
  px: number;
  style?: React.CSSProperties;
}) {
  const w = sprite.rows[0].length;
  const h = sprite.rows.length;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * px}
      height={h * px}
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated", display: "block", ...style }}
    >
      {sprite.rows.flatMap((row, y) =>
        row.split("").map((c, x) =>
          c === "." ? null : (
            <rect key={x + "," + y} x={x} y={y} width={1.02} height={1.02} fill={sprite.colors[c]} />
          )
        )
      )}
    </svg>
  );
}

/* ---------------- game data ---------------- */
const CASTLE = { x: 50, y: 82 };
const TURRET_POS = [
  { x: 33, y: 74 },
  { x: 44, y: 73 },
  { x: 56, y: 73 },
  { x: 67, y: 74 },
];
const TURRET_CD = 1.0;
const MAX_TURRETS = 4;

type Kind =
  | "goblin"
  | "orc"
  | "knight"
  | "wolf"
  | "gargoyle"
  | "shieldk"
  | "sapper"
  | "dragon"
  | "swarm"
  | "brute"
  | "splitter"
  | "crouton"
  | "croissant"
  | "baguette"
  | "muffin"
  | "crepe"
  | "croissantking"
  | "crepewraith"
  | "muffincolossus"
  | "pretzel"
  | "waffle"
  | "ram"
  | "cyclops"
  | "wyvern"
  | "bat"
  | "mole"
  | "cryptworm";
const KIND_STATS: Record<
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
const ATK_RATE: Record<Kind, number> = {
  goblin: 1.2, orc: 1.3, knight: 1.4, wolf: 0.7, gargoyle: 1.0, shieldk: 1.6,
  sapper: 2.2, dragon: 2.6, swarm: 0.6, brute: 1.8, splitter: 1.2, crouton: 0.9,
  croissant: 1.2, baguette: 1.1, muffin: 1.6, crepe: 1.2,
  croissantking: 2.4, crepewraith: 2.0, muffincolossus: 2.8,
  pretzel: 1.1, waffle: 1.5, ram: 2.0, cyclops: 1.7, wyvern: 1.0, bat: 0.8,
  mole: 1.4, cryptworm: 1.8,
};

/* bosses rotate every 5 waves: dragon → croissant king → crêpe wraith → muffin colossus */
const BOSSES: { kind: Kind; name: string }[] = [
  { kind: "dragon", name: "DRAGON" },
  { kind: "croissantking", name: "CROISSANT KING" },
  { kind: "crepewraith", name: "CRÊPE WRAITH" },
  { kind: "muffincolossus", name: "MUFFIN COLOSSUS" },
];

/* flying enemies — the turrets' favorite prey (archers prefer the ground) */
const isAir = (kind: Kind) =>
  kind === "dragon" || kind === "gargoyle" || kind === "crepe" || kind === "crepewraith" ||
  kind === "wyvern" || kind === "bat";
/* tunnelers — mid/late-game threats only earthworm turrets can shoot */
const isUnder = (kind: Kind) => kind === "mole" || kind === "cryptworm";

/* ground archers flank the castle on the grass */
const ARCHER_POS = [
  { x: 24, y: 87 },
  { x: 32, y: 89 },
  { x: 68, y: 89 },
  { x: 76, y: 87 },
];
const ARCHER_CD = 1.15;
const MAX_ARCHERS = 4;

/* earthworm turrets live in the dirt — only they can shoot underground enemies */
const WORM_POS = [
  { x: 22, y: 108 },
  { x: 78, y: 108 },
];
const WORM_CD = 1.6;
const MAX_WORMS = 2;

/* the keep grows only when you FORTIFY it (world size) — not per level */
const castleScaleOf = (fortLvl: number) => Math.min(1.4, 1 + 0.05 * fortLvl);

/* camera: a clearly visible zoom-out every wave, plus a bigger snap each new world.
   z = 1 shows the classic W1-1 view; smaller z = more world on screen.
   The keep itself does NOT grow per level — everything shrinking together is
   what makes the map read as getting bigger. */
const camZoomOf = (wave: number) => {
  const world = Math.floor((wave - 1) / 5);
  const stage = ((wave - 1) % 5) + 1;
  return Math.max(0.28, Math.pow(0.75, world) * (1 - 0.05 * (stage - 1)));
};

/* smooth camera: when a new wave starts, the pull-back to that wave's view eases
   in over ZOOM_EASE seconds so the player SEES the map grow instead of it snapping.
   zoomAt = 0 means "settled" (no animation running). */
const ZOOM_EASE = 3;
const camZoomNow = (g: Game) => {
  const target = camZoomOf(g.wave);
  if (!g.zoomAt) return target;
  const k = Math.min(1, (performance.now() / 1000 - g.zoomAt) / ZOOM_EASE);
  if (k >= 1) return target;
  const e = k * k * (3 - 2 * k); /* smoothstep */
  return g.zoomFrom + (target - g.zoomFrom) * e;
};

/* underground set dressing (world coords) — revealed as the camera pulls back */
const ROCKS: { x: number; y: number; s: number }[] = [
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
const TUNNELS: { x: number; y: number; s: number }[] = [
  { x: 18, y: 118, s: 30 },
  { x: 50, y: 141, s: 40 },
  { x: 83, y: 126, s: 24 },
  { x: -110, y: 130, s: 26 },
  { x: 160, y: 150, s: 32 },
];
const PINES: { x: number; px: number }[] = [
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
const scaledPos = (base: { x: number; y: number }, s: number) => ({
  x: CASTLE.x + (base.x - CASTLE.x) * s,
  y: CASTLE.y + (base.y - CASTLE.y) * s,
});

/* wave numbering: worlds of 5 stages — W1-1 … W1-4, W1-BOSS, W2-1 … */
const waveLabel = (w: number) => {
  const world = Math.floor((w - 1) / 5) + 1;
  const stage = ((w - 1) % 5) + 1;
  return "W" + world + "-" + (stage === 5 ? "BOSS" : stage);
};

/* manual aim: only hits an enemy actually under the crosshair */
function enemyAt(g: Game, x: number, y: number, skip?: number[], under?: boolean): Enemy | null {
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

type Enemy = {
  id: number;
  kind: Kind;
  atkCd: number;
  atkAt: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  hitAt: number;
  dying: number | null;
  face: number;
  phase: number;
  path: number;
  pamp: number;
  pfreq: number;
  turn: number;
};
type Arrow = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  traveled: number;
  maxDist: number;
  dmg: number;
  crit: boolean;
  tint: string;
  pierce: boolean;
  hitIds: number[];
  under?: boolean;
};
type Pop = { id: number; x: number; y: number; text: string; color: string; born: number };
type Part = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  color: string;
  size: number;
};
type Coin = { id: number; x: number; y: number; born: number };

type Game = {
  wave: number;
  zoomFrom: number;
  zoomAt: number;
  score: number;
  gold: number;
  hp: number;
  maxHp: number;
  damage: number;
  dmgLvl: number;
  fortLvl: number;
  turrets: number;
  turretCds: number[];
  turretAngles: number[];
  archers: number;
  archerCds: number[];
  archerAngles: number[];
  enemies: Enemy[];
  arrows: Arrow[];
  pops: Pop[];
  remaining: number;
  nextSpawn: number;
  spawnGap: number;
  shakeUntil: number;
  castleHitAt: number;
  waveBannerUntil: number;
  lastBonus: number;
  hold: { x: number; y: number } | null;
  holdCd: number;
  shield: number;
  shieldLvl: number;
  shieldHitAt: number;
  worms: number;
  wormCds: number[];
  turretDmgLvl: number;
  turretRateLvl: number;
  turretRangeLvl: number;
  archerDmgLvl: number;
  archerRateLvl: number;
  archerRangeLvl: number;
  rapidLvl: number;
  doubleLvl: number;
  thornLvl: number;
  parts: Part[];
  coins: Coin[];
  hitstopUntil: number;
  goldPulseUntil: number;
  goldMult: number;
  range: number;
  rangeLvl: number;
  dCritChance: number;
  dCritLvl: number;
  pierce: number;
  pierceLvl: number;
  speedOn: boolean;
  speed3: boolean;
  autoOn: boolean;
};

function makeGame(): Game {
  return {
    wave: 1,
    zoomFrom: 1,
    zoomAt: 0,
    score: 0,
    gold: 0,
    hp: 100,
    maxHp: 100,
    damage: 3,
    dmgLvl: 0,
    fortLvl: 0,
    turrets: 0,
    turretCds: [0, 0, 0, 0],
    turretAngles: [0, 0, 0, 0],
    archers: 0,
    archerCds: [0, 0, 0, 0],
    archerAngles: [0, 0, 0, 0],
    enemies: [],
    arrows: [],
    pops: [],
    remaining: 0,
    nextSpawn: 0,
    spawnGap: 1.2,
    shakeUntil: 0,
    castleHitAt: -10,
    waveBannerUntil: 0,
    lastBonus: 0,
    hold: null,
    holdCd: 0,
    shield: 0,
    shieldLvl: 0,
    shieldHitAt: -10,
    worms: 0,
    wormCds: [0, 0],
    turretDmgLvl: 0,
    turretRateLvl: 0,
    turretRangeLvl: 0,
    archerDmgLvl: 0,
    archerRateLvl: 0,
    archerRangeLvl: 0,
    rapidLvl: 0,
    doubleLvl: 0,
    thornLvl: 0,
    parts: [],
    coins: [],
    hitstopUntil: 0,
    goldPulseUntil: 0,
    goldMult: 1,
    range: 78,
    rangeLvl: 0,
    dCritChance: 0.1,
    dCritLvl: 0,
    pierce: 0,
    pierceLvl: 0,
    speedOn: false,
    speed3: false,
    autoOn: false,
  };
}

/* ---------------- meta progression ---------------- */
type Meta = {
  gold: number;
  rubies: number;
  walls: number;
  fletcher: number;
  chest: number;
  engineer: number;
  longbow: number;
  eagle: number;
  speed: number;
  autoshoot: number;
  autonext: number;
  x3: number;
};
const META_DEFAULT: Meta = {
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
const META_UPGRADES: { key: keyof Omit<Meta, "gold">; name: string; desc: string; costs: number[] }[] = [
  { key: "walls", name: "REINFORCED WALLS", desc: "+25 starting castle HP", costs: [40, 80, 160, 320] },
  { key: "fletcher", name: "MASTER FLETCHER", desc: "+1 starting arrow damage", costs: [50, 100, 200, 400] },
  { key: "longbow", name: "LONGBOW", desc: "+10% starting shot range", costs: [40, 80, 160, 320] },
  { key: "eagle", name: "EAGLE EYE", desc: "+5% distance-crit chance", costs: [50, 100, 200] },
  { key: "chest", name: "WAR CHEST", desc: "+20% gold from kills", costs: [30, 60, 120] },
  { key: "engineer", name: "ENGINEER", desc: "Start every run with a free turret", costs: [100, 250, 500] },
];

/* ruby packs — the real-money part of the shop (free while we test, real price at launch) */
const RUBY_PACKS: { rubies: number; name: string; price: string }[] = [
  { rubies: 100, name: "POUCH OF RUBIES", price: "$0.99" },
  { rubies: 550, name: "CHEST OF RUBIES", price: "$4.99" },
  { rubies: 1500, name: "VAULT OF RUBIES", price: "$9.99" },
];
/* premium perks — permanent unlocks paid in rubies (bosses drop a few) */
const PERKS: { key: "speed" | "x3" | "autoshoot" | "autonext"; name: string; desc: string; cost: number }[] = [
  { key: "speed", name: "2× SPEED", cost: 300, desc: "Adds a 2× speed toggle button to the battlefield (bottom right)" },
  { key: "x3", name: "3× SPEED", cost: 500, desc: "Adds a 3× speed toggle next to the 2× button — for the truly impatient" },
  { key: "autoshoot", name: "AUTO SHOOT", cost: 400, desc: "Turrets & archers pick their own targets — your castle stays manual" },
  { key: "autonext", name: "AUTO NEXT", cost: 200, desc: "Cleared waves roll on automatically after a short countdown" },
];

function loadMeta(): Meta {
  try {
    const m = JSON.parse(localStorage.getItem("pixelkeep-meta") || "null");
    if (m && typeof m.gold === "number") return { ...META_DEFAULT, ...m };
  } catch {
    /* ignore */
  }
  return { ...META_DEFAULT };
}
function saveMeta(m: Meta) {
  try {
    localStorage.setItem("pixelkeep-meta", JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

/* ---------------- UI bits ---------------- */
function PixButton({
  children,
  color,
  onClick,
  disabled,
  small,
}: {
  children: React.ReactNode;
  color: string;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        "border-4 border-black font-bold tracking-wide text-black " +
        (small ? "px-3 py-2 text-[10px] " : "px-5 py-3 text-xs ") +
        "shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-[0_1px_0_#000] transition-all disabled:opacity-40 disabled:shadow-none disabled:active:translate-y-0"
      }
      style={{ background: color, touchAction: "manipulation" }}
    >
      {children}
    </button>
  );
}

/* one uniform card per upgrade: icon + name + description on the left,
   the price and the BUY button stacked on the RIGHT side of the card.
   every card is the same width and min-height, no matter how long the text is */
function UpgradeCard({
  icon,
  name,
  desc,
  cost,
  disabled,
  done,
  locked,
  action,
  onClick,
}: {
  icon: string;
  name: string;
  desc: string;
  cost: string;
  disabled?: boolean;
  done?: string;
  locked?: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className="w-full border-2 border-black flex items-stretch"
      style={{ background: "#202642", minHeight: 96 }}
    >
      <div className="flex-1 min-w-0 px-2 pt-1.5 pb-2">
        <div className="flex items-start gap-2">
          <span className="text-sm leading-4">{icon}</span>
          <span className="text-[9px] text-white leading-4 flex-1">{name}</span>
        </div>
        <div className="pt-1 text-[8px] text-white/55 leading-4">{desc}</div>
      </div>
      <div
        className="border-l-2 border-black px-2 py-1.5 flex flex-col items-center justify-center gap-1 shrink-0"
        style={{ background: "#1a1f33", minWidth: 84 }}
      >
        {locked ? (
          <span className="text-[9px] text-[#ffd76e] text-center leading-4 py-1">
            🔒 {locked}
          </span>
        ) : done ? (
          <span className="text-[9px] text-[#4caf50] text-center leading-4 py-1">✓ {done}</span>
        ) : (
          <>
            {cost !== "" && <span className="text-[8px] text-[#ffd76e] leading-3">{cost}</span>}
            <PixButton small color={disabled ? "#555c73" : "#4caf50"} onClick={onClick} disabled={disabled}>
              {action || "BUY"}
            </PixButton>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- main component ---------------- */
export default function PixelKeep() {
  const [phase, setPhase] = useState<"menu" | "playing" | "intermission" | "gameover">("menu");
  const [, setTick] = useState(0);
  const idRef = useRef(1);
  const audioRef = useRef<AudioContext | null>(null);
  const gRef = useRef<Game | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  if (!gRef.current) gRef.current = makeGame();

  const [best, setBest] = useState(() => {
    try {
      return Number(localStorage.getItem("pixelkeep-best")) || 0;
    } catch {
      return 0;
    }
  });
  const [meta, setMeta] = useState<Meta>(loadMeta);
  const metaRef = useRef(meta);
  metaRef.current = meta;
  const [showArmory, setShowArmory] = useState(false);
  const [lastEarn, setLastEarn] = useState(0);
  const [tab, setTab] = useState<"none" | "shop" | "upgrades">("none");
  const tabRef = useRef(tab);
  tabRef.current = tab;
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;
  const [quitWarn, setQuitWarn] = useState(false);
  const [shopTab, setShopTab] = useState<"rubies" | "perks">("rubies");
  const [upTab, setUpTab] = useState<"arrows" | "defense" | "turrets" | "archers" | "worms">("arrows");
  const [showHowTo, setShowHowTo] = useState(false);
  const [menuShop, setMenuShop] = useState(false);
  const [splash, setSplash] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"general" | "sound" | "about">("general");
  const [restoreMsg, setRestoreMsg] = useState("");
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [soundOn, setSoundOn] = useState(() => {
    try {
      return localStorage.getItem("pixelkeep-sound") !== "off";
    } catch {
      return true;
    }
  });
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;

  /* studio splash: logo shows behind black at launch, fades out, menu fades in */
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);
  const aspectRef = useRef(4 / 3); // field height / width, measured every frame

  const ensureAudio = () => {
    if (!audioRef.current) {
      try {
        const Ctx =
          window.AudioContext ||
          ((window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
        audioRef.current = new Ctx();
      } catch {
        /* no audio */
      }
    }
  };

  const beep = (freq: number, dur = 0.07, type: OscillatorType = "square", vol = 0.05) => {
    try {
      if (!soundOnRef.current) return;
      const ctx = audioRef.current;
      if (!ctx) return;
      const o = ctx.createOscillator();
      const gain = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(gain);
      gain.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + dur);
    } catch {
      /* ignore */
    }
  };

  /* ----- projectiles: range, flight time, distance crits ----- */
  const ARROW_SPEED = 270; // field-width-% per second

  const dist2d = (x1: number, y1: number, x2: number, y2: number) => {
    const asp = aspectRef.current;
    return Math.hypot(x2 - x1, (y2 - y1) * asp);
  };

  const fireShot = (
    sx: number,
    sy: number,
    ax: number,
    ay: number,
    unit: "castle" | "turret" | "archer" | "worm"
  ) => {
    const g = gRef.current!;
    const asp = aspectRef.current;
    const dx = ax - sx;
    const dy = (ay - sy) * asp;
    const d = Math.hypot(dx, dy);
    if (d < 0.5) return;
    const dCrit = Math.random() < g.dCritChance;
    const pierce = Math.random() < g.pierce;
    /* unit range tech: long barrels / eagle archers stretch their shots */
    const rangeMul =
      unit === "castle"
        ? 1
        : unit === "turret"
        ? 0.9 * (1 + 0.1 * g.turretRangeLvl)
        : unit === "archer"
        ? 0.9 * (1 + 0.1 * g.archerRangeLvl)
        : 0.9;
    const range = g.range * (dCrit ? 2 : 1) * rangeMul;
    /* the tap only sets the DIRECTION: arrows always fly their full range,
       carrying on past the tap point until they hit something or run out */
    const flight = range;
    const crit = Math.random() < (unit === "castle" ? 0.15 : 0.1);
    /* heavy bolts / broadheads add flat damage to turret, worm & archer shots */
    const flat =
      unit === "turret" || unit === "worm"
        ? g.turretDmgLvl
        : unit === "archer"
        ? g.archerDmgLvl
        : 0;
    const dmg =
      unit === "castle"
        ? Math.round(g.damage * (crit ? 2 : 1))
        : Math.max(1, Math.round((g.damage * 0.5 + flat) * (crit ? 2 : 1)));
    g.arrows.push({
      id: idRef.current++,
      x: sx,
      y: sy,
      vx: (dx / d) * ARROW_SPEED,
      vy: ((dy / d) * ARROW_SPEED) / asp,
      speed: ARROW_SPEED,
      traveled: 0,
      maxDist: flight,
      dmg,
      crit,
      tint: dCrit ? "#ff5b4d" : unit === "worm" ? "#c2543f" : unit === "archer" ? "#8fd48f" : unit === "turret" ? "#c2c8cf" : "#f7a41d",
      pierce,
      hitIds: [],
      under: unit === "worm",
    });
    beep(dCrit ? 1040 : 500, 0.04, "square", 0.03);
  };

  /* AUTO SHOOT (IAP): turrets focus AIR enemies, archers focus LAND enemies,
     earthworms hunt TUNNELERS. Air & ground units cannot hit tunnelers,
     so they never waste shots on them. */
  const autoTarget = (pref: "air" | "ground" | "under") => {
    const g = gRef.current!;
    let best: Enemy | null = null;
    let bd = Infinity;
    let alt: Enemy | null = null;
    let ad = Infinity;
    for (const e of g.enemies) {
      if (e.dying != null) continue;
      if (pref !== "under" && isUnder(e.kind)) continue;
      if (pref === "under" && !isUnder(e.kind)) continue;
      const d = dist2d(CASTLE.x, CASTLE.y - 4, e.x, e.y);
      if ((pref === "air") === isAir(e.kind)) {
        if (d < bd) {
          bd = d;
          best = e;
        }
      } else if (d < ad) {
        ad = d;
        alt = e;
      }
    }
    const tgt = best ?? alt;
    if (!tgt) return null;
    const dx = CASTLE.x - tgt.x;
    const dy = CASTLE.y - tgt.y;
    const d2 = Math.hypot(dx, dy) || 1;
    const vx = (dx / d2) * tgt.speed;
    const vy = (dy / d2) * tgt.speed;
    const t = Math.min(0.5, Math.min(bd, ad) / ARROW_SPEED);
    return { x: tgt.x + vx * t, y: tgt.y + vy * t };
  };

  /* ----- shared damage logic ----- */
  const damageEnemy = (e: Enemy, dmg: number, crit: boolean, now: number) => {
    const g = gRef.current!;
    const st = KIND_STATS[e.kind];
    const armored = st.armored && !crit;
    const dealt = armored ? Math.max(1, Math.ceil(dmg * 0.6)) : dmg;
    e.hp -= dealt;
    e.hitAt = now;
    g.pops.push({
      id: idRef.current++,
      x: e.x,
      y: e.y - 10,
      text: crit ? dealt + "!" : armored ? dealt + "⛨" : String(dealt),
      color: crit ? "#ffd24a" : armored ? "#9ca3af" : "#ffffff",
      born: now,
    });
    beep(crit ? 940 : armored ? 440 : 620, 0.05, "square", 0.04);
    if (e.hp <= 0) {
      e.dying = now;
      g.score += st.score;
      const goldGain = Math.round(st.gold * g.goldMult);
      g.gold += goldGain;
      g.pops.push({
        id: idRef.current++,
        x: e.x,
        y: e.y - 18,
        text: "+" + goldGain,
        color: "#ffd24a",
        born: now,
      });
      /* kill juice: particle burst, coin fly, hit-stop */
      const bossy =
        e.kind === "dragon" ||
        e.kind === "croissantking" ||
        e.kind === "crepewraith" ||
        e.kind === "muffincolossus";
      const n = bossy ? 24 : 10;
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 18 + Math.random() * 32;
        g.parts.push({
          id: idRef.current++,
          x: e.x,
          y: e.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 28,
          born: now,
          color: st.pcolor,
          size: 3 + Math.floor(Math.random() * 3),
        });
      }
      g.coins.push({ id: idRef.current++, x: e.x, y: e.y, born: now });
      /* bosses drop rubies — the premium currency */
      if (bossy) {
        const gems = 5 + Math.floor(Math.random() * 6);
        const m = { ...metaRef.current, rubies: metaRef.current.rubies + gems };
        setMeta(m);
        metaRef.current = m;
        saveMeta(m);
        g.pops.push({
          id: idRef.current++,
          x: e.x,
          y: e.y - 26,
          text: "+" + gems + " ♦",
          color: "#ff4d6d",
          born: now,
        });
      }
      g.goldPulseUntil = now + 0.5;
      g.hitstopUntil = now + (bossy ? 0.12 : 0.04);
      beep(200, 0.15, "sawtooth", 0.05);
      /* splitter bursts into two swarm imps */
      if (e.kind === "splitter") {
        spawnEnemy("swarm", Math.max(6, e.x - 5), e.y);
        spawnEnemy("swarm", Math.min(94, e.x + 5), e.y);
      }
    }
  };

  const spawnEnemy = (kind: Kind, ox?: number, oy?: number) => {
    const g = gRef.current!;
    const st = KIND_STATS[kind];
    const hp = Math.round(st.hp * (1 + (g.wave - 1) * 0.4));
    /* the map expands with progress: enemies now pour in from ALL sides —
       the top edge AND both flanks — just beyond the visible world */
    const zz = camZoomNow(g);
    const half = 50 / zz;
    const top = (-50 * (1 - zz)) / zz;
    let px = ox;
    let py = oy;
    if (px == null && py == null) {
      const left = Math.random() < 0.5;
      if (g.wave < 4) {
        /* early waves: everyone pours in from the top edge — classic siege feel.
           Ground troops start flank-marching from wave 4/5 */
        px = 50 - (half - 12) + Math.random() * (half - 12) * 2;
        py = top - 8 - Math.random() * 12;
      } else if (isUnder(kind)) {
        /* tunnelers burrow in from the flanks, deep in the dirt */
        px = left ? 50 - half - 12 - Math.random() * 16 : 50 + half + 12 + Math.random() * 16;
        py = 100 + Math.random() * 26;
      } else if (isAir(kind)) {
        /* flyers drop in from the top edge */
        px = 50 - (half - 12) + Math.random() * (half - 12) * 2;
        py = top - 8 - Math.random() * 12;
      } else {
        /* ground troops march in along the grass from either flank */
        px = left ? 50 - half - 10 - Math.random() * 14 : 50 + half + 10 + Math.random() * 14;
        py = 82 + Math.random() * 8;
      }
    }
    g.enemies.push({
      id: idRef.current++,
      kind,
      x: px!,
      y: py!,
      hp,
      maxHp: hp,
      speed: st.speed * (0.9 + Math.random() * 0.2),
      hitAt: -10,
      atkCd: 0.4,
      atkAt: -10,
      dying: null,
      face: 1,
      phase: Math.random() * 6.28,
      path: pickPath(kind),
      pamp: 8 + Math.random() * 10,
      pfreq: 2.2 + Math.random() * 2.4,
      turn: (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.5),
    });
  };

  const pickKind = (wave: number): Kind => {
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
  const pickPath = (kind: Kind): number => {
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

  const startWave = (w: number) => {
    const g = gRef.current!;
    const t = performance.now() / 1000;
    /* the camera eases from the view we just played at to the new wave's wider
       view over 3s — wave 1 starts settled, no animation */
    const prevZoom = w <= 1 ? camZoomOf(1) : camZoomOf(w - 1);
    g.wave = w;
    g.zoomFrom = prevZoom;
    g.zoomAt = w <= 1 ? 0 : t;
    g.remaining = Math.min(5 + w * 2, 24);
    g.spawnGap = Math.max(0.35, 1.4 - w * 0.06);
    g.nextSpawn = t + 0.7;
    g.waveBannerUntil = t + 1.4;
    g.turretCds = g.turretCds.map(() => 0.3 + Math.random() * 0.5);
    g.archerCds = g.archerCds.map(() => 0.3 + Math.random() * 0.5);
    g.wormCds = g.wormCds.map(() => 0.3 + Math.random() * 0.5);
    /* FORCE SHIELD regenerates fully between waves */
    g.shield = 30 * g.shieldLvl;
    if (w % 5 === 0) {
      /* bosses always make a grand entrance: top center, beyond the world edge */
      const bz = camZoomNow(g);
      spawnEnemy(
        BOSSES[(Math.floor(w / 5) - 1) % BOSSES.length].kind,
        50,
        (-50 * (1 - bz)) / bz - 10
      );
    }
    setTab("none");
    setPhase("playing");
  };

  const update = (now: number, dt: number) => {
    const g = gRef.current!;
    /* hit-stop: brief freeze on kills for impact feel */
    if (now < g.hitstopUntil) return;
    /* browsing shop / upgrades mid-fight pauses the action — so does the pause menu */
    if (tabRef.current !== "none" || pausedRef.current) return;
    /* 2× / 3× SPEED (IAP): run the whole simulation at double or triple pace */
    const sm = g.speed3 ? 3 : g.speedOn ? 2 : 1;
    dt *= sm;
    /* measure the live field aspect (mobile fullscreen vs desktop card) */
    const el = fieldRef.current;
    if (el && el.clientWidth > 0) {
      const asp = el.clientHeight / el.clientWidth;
      if (asp > 0.5 && asp < 3 && isFinite(asp)) aspectRef.current = asp;
    }
    /* spawning */
    if (g.remaining > 0 && now >= g.nextSpawn) {
      g.remaining--;
      const kind = pickKind(g.wave);
      if (kind === "swarm") {
        /* swarms arrive 3-4 at a time in a tight cluster */
        const n = 3 + Math.floor(Math.random() * 2);
        const bx = 15 + Math.random() * 70;
        for (let k = 0; k < n; k++) {
          spawnEnemy(
            "swarm",
            Math.min(94, Math.max(6, bx + (Math.random() - 0.5) * 12)),
            -8 - Math.random() * 6
          );
        }
      } else {
        spawnEnemy(kind);
      }
      g.nextSpawn = now + (g.spawnGap * (0.75 + Math.random() * 0.5)) / sm;
    }

    /* the castle is ALWAYS yours — manual aim only, hold to fire */
    if (g.hold) {
      g.holdCd -= dt;
      if (g.holdCd <= 0) {
        fireShot(CASTLE.x, CASTLE.y - 4, g.hold.x, g.hold.y, "castle");
        /* DOUBLE-STRING: a chance to loose a second arrow */
        if (Math.random() < 0.08 * g.doubleLvl) {
          fireShot(
            CASTLE.x,
            CASTLE.y - 4,
            g.hold.x + (Math.random() - 0.5) * 8,
            g.hold.y + (Math.random() - 0.5) * 8,
            "castle"
          );
        }
        g.holdCd = 0.18 / (1 + 0.15 * g.rapidLvl);
      }
    }

    /* turrets: rotate toward the player's crosshair and fire where the player aims.
       AUTO SHOOT (IAP): turrets pick their own targets and focus AIR enemies */
    const cScale = castleScaleOf(g.fortLvl);
    const auto = metaRef.current.autoshoot > 0 && g.autoOn;
    if (g.turrets > 0) {
      for (let i = 0; i < g.turrets; i++) {
        const tp = scaledPos(TURRET_POS[i], cScale);
        const tgt = auto && !g.hold ? autoTarget("air") : null;
        const aimX = g.hold ? g.hold.x : tgt ? tgt.x : tp.x;
        const aimY = g.hold ? g.hold.y : tgt ? tgt.y : tp.y - 10;
        const desired = (Math.atan2(aimX - tp.x, -(aimY - tp.y)) * 180) / Math.PI;
        g.turretAngles[i] += (desired - g.turretAngles[i]) * Math.min(1, dt * 12);
        g.turretCds[i] -= dt;
        if ((g.hold || tgt) && g.turretCds[i] <= 0) {
          fireShot(tp.x, tp.y - 2, aimX, aimY, "turret");
          g.turretCds[i] = (TURRET_CD * (0.8 + Math.random() * 0.4)) / (1 + 0.2 * g.turretRateLvl);
        }
        if (g.turretCds[i] < 0) g.turretCds[i] = 0;
      }
    }

    /* ground archers flanking the castle — also fire where you aim.
       AUTO SHOOT (IAP): archers pick their own targets and focus LAND enemies */
    if (g.archers > 0) {
      for (let i = 0; i < g.archers; i++) {
        const ap = scaledPos(ARCHER_POS[i], cScale);
        const tgt = auto && !g.hold ? autoTarget("ground") : null;
        const aimX = g.hold ? g.hold.x : tgt ? tgt.x : ap.x;
        const aimY = g.hold ? g.hold.y : tgt ? tgt.y : ap.y - 10;
        const desired = (Math.atan2(aimX - ap.x, -(aimY - ap.y)) * 180) / Math.PI;
        g.archerAngles[i] += (desired - g.archerAngles[i]) * Math.min(1, dt * 12);
        g.archerCds[i] -= dt;
        if ((g.hold || tgt) && g.archerCds[i] <= 0) {
          fireShot(ap.x, ap.y - 2, aimX, aimY, "archer");
          g.archerCds[i] = (ARCHER_CD * (0.8 + Math.random() * 0.4)) / (1 + 0.2 * g.archerRateLvl);
        }
        if (g.archerCds[i] < 0) g.archerCds[i] = 0;
      }
    }

    /* earthworm turrets: the ONLY unit that can shoot underground enemies */
    if (g.worms > 0) {
      for (let i = 0; i < g.worms; i++) {
        const wp = scaledPos(WORM_POS[i], cScale);
        const tgt = auto && !g.hold ? autoTarget("under") : null;
        g.wormCds[i] -= dt;
        if ((g.hold || tgt) && g.wormCds[i] <= 0) {
          fireShot(
            wp.x,
            wp.y - 2,
            g.hold ? g.hold.x : tgt!.x,
            g.hold ? g.hold.y : tgt!.y,
            "worm"
          );
          g.wormCds[i] = WORM_CD * (0.8 + Math.random() * 0.4);
        }
        if (g.wormCds[i] < 0) g.wormCds[i] = 0;
      }
    }

    /* enemy movement & gate attacks */
    for (let i = g.enemies.length - 1; i >= 0; i--) {
      const e = g.enemies[i];
      if (e.dying != null) {
        if (now - e.dying > 0.22) g.enemies.splice(i, 1);
        continue;
      }
      const dx = CASTLE.x - e.x;
      const dy = CASTLE.y - e.y;
      const dist = Math.hypot(dx, dy);
      const reach = KIND_STATS[e.kind].reach * cScale;
      if (dist < reach) {
        /* enemies dig in at the gate and attack on their own rhythm —
           they stay alive until you kill them */
        e.atkCd -= dt;
        if (e.atkCd <= 0) {
          const dmg = KIND_STATS[e.kind].dmg;
          e.atkCd = ATK_RATE[e.kind];
          e.atkAt = now;
          /* FORCE SHIELD: a bubble that soaks hits and regens between waves */
          if (g.shield > 0) {
            g.shield = Math.max(0, g.shield - dmg);
            g.shieldHitAt = now;
            g.pops.push({
              id: idRef.current++,
              x: CASTLE.x,
              y: CASTLE.y - 26,
              text: "⛨ -" + dmg,
              color: "#7ecbff",
              born: now,
            });
            beep(320, 0.1, "sine", 0.05);
          } else {
            g.hp -= dmg;
            g.castleHitAt = now;
            g.shakeUntil = now + 0.35;
            beep(90, 0.25, "square", 0.07);
          }
          /* THORNY WALLS: attackers get zapped for biting the keep */
          if (g.thornLvl > 0) damageEnemy(e, 2 + 2 * g.thornLvl, false, now);
        }
        if (g.hp <= 0) {
          g.hp = 0;
          setPhase("gameover");
          return;
        }
        continue;
      }
      if (Math.abs(dx) > 0.8) e.face = dx > 0 ? 1 : -1;
      const st = KIND_STATS[e.kind];
      let mvx = (dx / dist) * e.speed * dt;
      let mvy = (dy / dist) * e.speed * dt;
      /* built-in weave (wolf, gargoyle, swarm) */
      mvx += Math.sin(now * st.wfreq + e.phase) * st.weave * dt;
      /* approach path patterns */
      if (e.path === 1) {
        /* sine sweep: big side-to-side glide while advancing */
        mvx += Math.sin(now * e.pfreq + e.phase) * e.pamp * dt;
      } else if (e.path === 2) {
        /* curved arc: steer wide when far, straighten near the castle */
        const ang = Math.atan2(dy, dx) + e.turn * Math.min(1.1, dist / 80);
        mvx = Math.cos(ang) * e.speed * dt;
        mvy = Math.sin(ang) * e.speed * dt;
      } else if (e.path === 3) {
        /* zigzag: sharp alternating dashes */
        const dir = Math.sin(now * e.pfreq + e.phase) > 0 ? 1 : -1;
        mvx += dir * e.speed * 0.9 * dt;
      }
      e.x += mvx;
      e.y += mvy;
      if (e.x < -270) e.x = -270;
      if (e.x > 370) e.x = 370;
      /* zone rules: flyers own the sky, grunts own the grass, tunnelers own the dirt */
      if (isAir(e.kind)) {
        if (e.y > 78) e.y = 78;
      } else if (isUnder(e.kind)) {
        if (e.y < 98) e.y = 98;
        if (e.y > 128) e.y = 128;
      } else {
        /* grunts march on the grass; ones still up high slide down to it */
        if (e.y < 82) e.y = Math.min(82, e.y + 60 * dt);
        if (e.y > 90) e.y = 90;
      }
    }

    /* projectile flight: arrows fly the full range and hit whatever they touch */
    for (let i = g.arrows.length - 1; i >= 0; i--) {
      const a = g.arrows[i];
      const step = a.speed * dt;
      if (step <= 0) continue;
      let nx = a.x + a.vx * dt;
      let ny = a.y + a.vy * dt;
      let done = false;
      if (a.traveled + step >= a.maxDist) {
        const f = Math.max(0, (a.maxDist - a.traveled) / step);
        nx = a.x + a.vx * dt * f;
        ny = a.y + a.vy * dt * f;
        done = true;
      }
      /* swept hit test along this step so fast arrows don't tunnel through enemies */
      let hit: Enemy | null = null;
      const samples = Math.max(1, Math.ceil(step / 2.5));
      for (let s = 1; s <= samples; s++) {
        const t = s / samples;
        hit = enemyAt(g, a.x + (nx - a.x) * t, a.y + (ny - a.y) * t, a.hitIds, a.under);
        if (hit) break;
      }
      a.x = nx;
      a.y = ny;
      a.traveled += step;
      if (hit) {
        damageEnemy(hit, a.dmg, a.crit, now);
        a.hitIds.push(hit.id);
        if (!a.pierce) {
          /* stops on the first enemy it touches */
          g.arrows.splice(i, 1);
          continue;
        }
        /* piercing arrow sails straight through and keeps hunting */
      }
      if (done) {
        /* flew its full range into empty ground: little dust puff */
        g.parts.push({
          id: idRef.current++,
          x: a.x,
          y: a.y,
          vx: (Math.random() - 0.5) * 12,
          vy: -6,
          born: now,
          color: "#8d99ae",
          size: 3,
        });
        g.arrows.splice(i, 1);
      }
    }

    g.pops = g.pops.filter((p) => now - p.born < 0.7);

    /* particles & coins */
    for (const pt of g.parts) {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 110 * dt;
    }
    g.parts = g.parts.filter((p) => now - p.born < 0.55);
    g.coins = g.coins.filter((c) => now - c.born < 0.5);

    /* wave clear */
    if (g.remaining === 0 && g.enemies.length === 0) {
      g.lastBonus = 8 + g.wave * 3;
      g.gold += g.lastBonus;
      g.arrows = [];
      g.pops = [];
      g.parts = [];
      g.coins = [];
      g.hold = null;
      beep(523, 0.1, "square", 0.05);
      setTimeout(() => beep(784, 0.14, "square", 0.05), 110);
      setPhase("intermission");
    }
  };

  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      update(t / 1000, dt);
      setTick((n) => n + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase === "gameover") {
      const g = gRef.current!;
      const b = Math.max(best, g.score);
      try {
        localStorage.setItem("pixelkeep-best", String(b));
      } catch {
        /* ignore */
      }
      setBest(b);
      /* convert score into permanent meta gold */
      const earned = Math.floor(g.score / 10);
      setLastEarn(earned);
      const m = { ...metaRef.current, gold: metaRef.current.gold + earned };
      setMeta(m);
      metaRef.current = m;
      saveMeta(m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* AUTO NEXT (IAP): cleared waves roll on after a short countdown.
     Opening the shop or upgrades cancels the countdown so browsing is never interrupted. */
  const [autoNextIn, setAutoNextIn] = useState(0);
  useEffect(() => {
    if (phase !== "intermission" || metaRef.current.autonext < 1 || tab !== "none" || quitWarn) {
      setAutoNextIn(0);
      return;
    }
    const target = Date.now() + 6000;
    setAutoNextIn(6);
    const iv = setInterval(() => {
      setAutoNextIn(Math.max(0, Math.ceil((target - Date.now()) / 1000)));
    }, 250);
    const to = setTimeout(() => {
      clearInterval(iv);
      ensureAudio();
      startWave(gRef.current!.wave + 1);
    }, 6000);
    return () => {
      clearInterval(iv);
      clearTimeout(to);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, tab, meta.autonext, quitWarn]);

  /* ----- pointer input (hold & drag to fire) ----- */
  /* screen % → world coords through the camera */
  const screenToWorld = (sx: number, sy: number) => {
    const zz = camZoomNow(gRef.current!);
    return { x: (sx - 50 * (1 - zz)) / zz, y: (sy - 50 * (1 - zz)) / zz };
  };
  const pointerPos = (ev: React.PointerEvent) => {
    const rect = fieldRef.current!.getBoundingClientRect();
    return {
      x: ((ev.clientX - rect.left) / rect.width) * 100,
      y: ((ev.clientY - rect.top) / rect.height) * 100,
    };
  };
  const onFieldDown = (ev: React.PointerEvent) => {
    if (phase !== "playing") return;
    ev.preventDefault();
    const g = gRef.current!;
    const p = pointerPos(ev);
    g.hold = screenToWorld(p.x, p.y);
    g.holdCd = 0; // fire immediately
    g.turretCds = g.turretCds.map((_, i) => 0.05 + i * 0.08); // turrets respond fast
    g.archerCds = g.archerCds.map((_, i) => 0.05 + i * 0.08); // archers too
    setTick((t) => t + 1);
  };
  const onFieldMove = (ev: React.PointerEvent) => {
    const g = gRef.current!;
    if (!g.hold) return;
    const p = pointerPos(ev);
    const w = screenToWorld(p.x, p.y);
    g.hold.x = w.x;
    g.hold.y = w.y;
  };
  const endHold = () => {
    const g = gRef.current!;
    g.hold = null;
    setTick((t) => t + 1);
  };

  /* ----- shop actions ----- */
  const dmgCost = 15 + gRef.current!.dmgLvl * 10;
  const fortCost = 20 + gRef.current!.fortLvl * 15;
  const turretCost = 50 + gRef.current!.turrets * 40;
  const fletchCost = 18 + gRef.current!.rangeLvl * 12;
  const eagleCost = 25 + gRef.current!.dCritLvl * 15;
  const pierceCost = 30 + gRef.current!.pierceLvl * 22;
  const buyFletching = () => {
    const g = gRef.current!;
    if (g.gold >= fletchCost) {
      g.gold -= fletchCost;
      g.rangeLvl++;
      g.range *= 1.12;
      beep(700, 0.08);
      setTick((t) => t + 1);
    }
  };
  const buyEagle = () => {
    const g = gRef.current!;
    if (g.dCritLvl < 3 && g.gold >= eagleCost) {
      g.gold -= eagleCost;
      g.dCritLvl++;
      g.dCritChance += 0.06;
      beep(980, 0.08);
      setTick((t) => t + 1);
    }
  };
  const buyPierce = () => {
    const g = gRef.current!;
    if (g.pierceLvl < 5 && g.gold >= pierceCost) {
      g.gold -= pierceCost;
      g.pierceLvl++;
      g.pierce += 0.1;
      beep(820, 0.08);
      setTick((t) => t + 1);
    }
  };
  const buyDamage = () => {
    const g = gRef.current!;
    if (g.gold >= dmgCost) {
      g.gold -= dmgCost;
      g.dmgLvl++;
      g.damage++;
      beep(760, 0.08);
      setTick((t) => t + 1);
    }
  };
  const buyFortify = () => {
    const g = gRef.current!;
    if (g.gold >= fortCost) {
      g.gold -= fortCost;
      g.fortLvl++;
      g.maxHp += 20;
      g.hp = Math.min(g.hp + 20, g.maxHp);
      beep(520, 0.08);
      setTick((t) => t + 1);
    }
  };
  const buyRepair = () => {
    const g = gRef.current!;
    if (g.gold >= 12 && g.hp < g.maxHp) {
      g.gold -= 12;
      g.hp = Math.min(g.hp + 35, g.maxHp);
      beep(600, 0.08);
      setTick((t) => t + 1);
    }
  };
  const buyTurret = () => {
    const g = gRef.current!;
    if (g.turrets < MAX_TURRETS && g.gold >= turretCost) {
      g.gold -= turretCost;
      g.turrets++;
      beep(660, 0.09, "square", 0.05);
      setTimeout(() => beep(880, 0.12, "square", 0.05), 90);
      setTick((t) => t + 1);
    }
  };
  const archerCost = 45 + gRef.current!.archers * 35;
  const buyArcher = () => {
    const g = gRef.current!;
    if (g.archers < MAX_ARCHERS && g.gold >= archerCost) {
      g.gold -= archerCost;
      g.archers++;
      beep(560, 0.09, "square", 0.05);
      setTimeout(() => beep(760, 0.12, "square", 0.05), 90);
      setTick((t) => t + 1);
    }
  };

  /* FORCE SHIELD: bubble HP, soaks hits, full regen between waves */
  const shieldCost = 60 + gRef.current!.shieldLvl * 50;
  const buyShield = () => {
    const g = gRef.current!;
    if (g.shieldLvl < 3 && g.gold >= shieldCost) {
      g.gold -= shieldCost;
      g.shieldLvl++;
      g.shield = 30 * g.shieldLvl;
      g.shieldHitAt = -10;
      beep(700, 0.09, "sine", 0.05);
      setTimeout(() => beep(1050, 0.12, "sine", 0.05), 90);
      setTick((t) => t + 1);
    }
  };
  const wormCost = 50 + gRef.current!.worms * 40;
  const buyWorm = () => {
    const g = gRef.current!;
    if (g.worms < MAX_WORMS && g.gold >= wormCost) {
      g.gold -= wormCost;
      g.worms++;
      g.wormCds = g.wormCds.map(() => 0.3 + Math.random() * 0.5);
      beep(400, 0.09, "square", 0.05);
      setTimeout(() => beep(300, 0.12, "square", 0.05), 90);
      setTick((t) => t + 1);
    }
  };

  /* leveled in-run upgrades: one helper for the whole tech tree */
  const lvCost = (lvl: number, base: number, step: number) => base + step * lvl;
  const buyLeveled = (
    key:
      | "turretDmgLvl"
      | "turretRateLvl"
      | "turretRangeLvl"
      | "archerDmgLvl"
      | "archerRateLvl"
      | "archerRangeLvl"
      | "rapidLvl"
      | "doubleLvl"
      | "thornLvl",
    max: number,
    base: number,
    step: number
  ) => {
    const g = gRef.current!;
    const lvl = g[key];
    const cost = lvCost(lvl, base, step);
    if (lvl >= max || g.gold < cost) return;
    g.gold -= cost;
    g[key] = lvl + 1;
    beep(660, 0.08, "square", 0.04);
    setTick((t) => t + 1);
  };

  const buyRubyPack = (rubies: number) => {
    /* real money at launch — free while we test */
    const m = { ...metaRef.current, rubies: metaRef.current.rubies + rubies };
    setMeta(m);
    metaRef.current = m;
    saveMeta(m);
    ensureAudio();
    beep(880, 0.08);
    setTimeout(() => beep(1170, 0.1), 90);
    setTick((t) => t + 1);
  };

  const buyPerk = (key: "speed" | "x3" | "autoshoot" | "autonext", cost: number) => {
    const m = { ...metaRef.current };
    if (m[key] > 0 || m.rubies < cost) return;
    m[key] = 1;
    m.rubies -= cost;
    setMeta(m);
    metaRef.current = m;
    saveMeta(m);
    ensureAudio();
    beep(880, 0.08);
    setTimeout(() => beep(1170, 0.1), 90);
    setTick((t) => t + 1);
  };

  /* ----- meta progression ----- */
  const toggleSound = () => {
    const v = !soundOn;
    setSoundOn(v);
    try {
      localStorage.setItem("pixelkeep-sound", v ? "on" : "off");
    } catch {
      /* sandboxed iframe */
    }
    if (v) {
      ensureAudio();
      beep(880, 0.08);
    }
  };
  const restorePurchases = () => {
    /* while testing everything is local: restore = re-read the saved meta */
    const m = loadMeta();
    setMeta(m);
    metaRef.current = m;
    setRestoreMsg("✓ Purchases restored to this device.");
    ensureAudio();
    beep(880, 0.08);
    setTimeout(() => beep(1170, 0.1), 90);
  };

  /* first time pressing PLAY? show the how-to first, nicely framed */
  const playPressed = () => {
    ensureAudio();
    let seen = true;
    try {
      seen = !!localStorage.getItem("pixelkeep-howto");
    } catch {
      /* sandboxed iframe */
    }
    if (seen) startGame();
    else setShowHowTo(true);
  };
  const dismissHowTo = () => {
    try {
      localStorage.setItem("pixelkeep-howto", "1");
    } catch {
      /* sandboxed iframe */
    }
    setShowHowTo(false);
    startGame();
  };

  const startGame = () => {
    const m = metaRef.current;
    const ng = makeGame();
    ng.maxHp = 100 + 25 * m.walls;
    ng.hp = ng.maxHp;
    ng.damage = 3 + m.fletcher;
    ng.goldMult = 1 + 0.2 * m.chest;
    ng.turrets = Math.min(m.engineer, MAX_TURRETS);
    ng.range = 78 * (1 + 0.1 * m.longbow);
    ng.dCritChance = 0.1 + 0.05 * m.eagle;
    ng.autoOn = m.autoshoot > 0;
    gRef.current = ng;
    setShowArmory(false);
    ensureAudio();
    startWave(1);
  };

  /* back to the main menu from intermission or the game-over screen */
  const goMenu = () => {
    setTab("none");
    setMenuShop(false);
    setShowArmory(false);
    setShowSettings(false);
    setShowPrivacy(false);
    setPaused(false);
    setQuitWarn(false);
    setPhase("menu");
    beep(392, 0.09);
  };

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

  /* ----- render ----- */
  const g = gRef.current!;
  const now = performance.now() / 1000;
  const hpRatio = g.hp / g.maxHp;
  const hpColor = hpRatio > 0.5 ? "#4caf50" : hpRatio > 0.25 ? "#f7a41d" : "#d9433b";
  const shaking = now < g.shakeUntil;
  const shakeX = shaking ? Math.sin(now * 55) * 5 : 0;
  const shakeY = shaking ? Math.cos(now * 47) * 3 : 0;
  const aimOut =
    phase === "playing" && g.hold
      ? dist2d(CASTLE.x, CASTLE.y - 4, g.hold.x, g.hold.y) > g.range
      : false;
  /* per-wave presentation: the camera pulls back every level — the map grows */
  const castleScale = castleScaleOf(g.fortLvl);
  const z = camZoomNow(g);
  /* world → screen %: the uniform camera transform (z = 1 shows the classic view) */
  const S = (v: number) => v * z + 50 * (1 - z);
  const boss =
    g.wave % 5 === 0 && g.wave >= 5
      ? BOSSES[(Math.floor(g.wave / 5) - 1) % BOSSES.length]
      : null;

  const stars = Array.from({ length: 26 }, (_, i) => ({
    x: ((i * 37) % 94) + 3,
    y: ((i * 53) % 48) + 3,
    s: (i % 3) + 2,
    o: 0.4 + 0.6 * Math.abs(Math.sin(now * 1.5 + i)),
  }));

  return (
    <div
      className="w-full flex flex-col items-center justify-center gap-3 select-none overflow-hidden"
      style={{
        height: "100dvh",
        padding:
          "env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)",
        background: "#12131f",
        fontFamily: "'Press Start 2P', 'Courier New', monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @keyframes popfloat { 0% { transform: translate(-50%,0); opacity:1 } 100% { transform: translate(-50%,-42px); opacity:0 } }
        @keyframes bannerflash { 0%,100% { opacity:1; transform: translate(-50%,-50%) scale(1) } 50% { opacity:.6; transform: translate(-50%,-50%) scale(1.15) } }
        @keyframes blink { 50% { opacity:.35 } }
        @keyframes crossspin { 0% { transform: translate(-50%,-50%) rotate(0deg) } 100% { transform: translate(-50%,-50%) rotate(360deg) } }
        @keyframes twinkle { 0%,100% { opacity:.2 } 50% { opacity:.9 } }
        @keyframes drift { 0% { transform: translateX(-20%) } 100% { transform: translateX(120%) } }
        @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
        @keyframes logoin { from { opacity: 0; transform: scale(0.92) } to { opacity: 1; transform: scale(1) } }
        @keyframes splashout { to { opacity: 0; visibility: hidden } }
        @keyframes shoot {
          0% { transform: translate(0,0); opacity: 0 }
          2% { opacity: 1 }
          9% { transform: translate(60vw,30vh); opacity: 0 }
          100% { transform: translate(60vw,30vh); opacity: 0 }
        }
        .scrollbox { scrollbar-width: thin; scrollbar-color: #f7a41d #10132a; }
        .scrollbox::-webkit-scrollbar { width: 10px; }
        .scrollbox::-webkit-scrollbar-track { background: #10132a; }
        .scrollbox::-webkit-scrollbar-thumb { background: #f7a41d; border: 2px solid #000; }
      `}</style>

      <h1 className="hidden sm:block text-[#f7a41d] text-sm sm:text-base tracking-widest drop-shadow-[0_3px_0_#000]">
        PIXEL KEEP
      </h1>

      {/* field */}
      <div
        ref={fieldRef}
        onPointerDown={onFieldDown}
        onPointerMove={onFieldMove}
        onPointerUp={endHold}
        onPointerCancel={endHold}
        onPointerLeave={endHold}
        className="relative w-full flex-1 min-h-0 sm:flex-none sm:max-w-[430px] sm:aspect-[3/4] overflow-hidden border-4 border-black cursor-crosshair"
        style={{
          background: "linear-gradient(#1b1f4b 0%, #2a2358 45%, #5b2f63 75%, #7a3b5e 100%)",
          boxShadow: "0 6px 0 #000",
          touchAction: "none",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}
        >
          {/* stars & moon */}
          {stars.map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.s,
                height: s.s,
                background: "#fff",
                opacity: s.o,
              }}
            />
          ))}
          <div className="absolute right-[8%] top-[5%]">
            <PixelSprite sprite={SPRITES.moon} px={6} style={{ opacity: 0.9 }} />
          </div>

          {/* ground & underground — real world space the camera reveals as you progress */}
          <div
            className="absolute"
            style={{
              left: `${S(-280)}%`,
              top: `${S(82)}%`,
              width: `${660 * z}%`,
              height: `${8 * z}%`,
              background: "#1d4d2b",
              borderTop: `${6 * z}px solid #0e2416`,
            }}
          />
          <div
            className="absolute"
            style={{
              left: `${S(-280)}%`,
              top: `${S(90)}%`,
              width: `${660 * z}%`,
              height: `${320 * z}%`,
              background: "linear-gradient(#4a3020 0%, #332014 35%, #1a1009 100%)",
            }}
          />
          {/* pines scattered across the widening land */}
          {PINES.map((t, i) => (
            <div
              key={"pine" + i}
              className="absolute"
              style={{
                left: `${S(t.x)}%`,
                top: `${S(87)}%`,
                transform: "translate(-50%,-100%)",
              }}
            >
              <PixelSprite sprite={SPRITES.pine} px={t.px * z} />
            </div>
          ))}
          {/* rocks buried in the dirt */}
          {ROCKS.map((r, i) => (
            <div
              key={"rock" + i}
              className="absolute"
              style={{
                left: `${S(r.x)}%`,
                top: `${S(r.y)}%`,
                width: r.s * z,
                height: r.s * z,
                background: "#241206",
                transform: "translate(-50%,-50%)",
              }}
            />
          ))}
          {/* sealed tunnels — foreshadowing the underground army */}
          {TUNNELS.map((t, i) => (
            <div
              key={"tunnel" + i}
              className="absolute"
              style={{
                left: `${S(t.x)}%`,
                top: `${S(t.y)}%`,
                width: t.s * z,
                height: t.s * 0.72 * z,
                background: "#0a0705",
                border: `${3 * z}px solid #3a2417`,
                borderRadius: "50%",
                transform: "translate(-50%,-50%)",
              }}
            />
          ))}

          {/* castle */}
          <div
            className="absolute"
            style={{
              left: `${S(CASTLE.x)}%`,
              top: `${S(CASTLE.y)}%`,
              transform: "translate(-50%,-50%)",
            }}
          >
            {g.shield > 0 && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%,-50%)",
                  width: 150 * castleScale * z,
                  height: 150 * castleScale * z,
                  borderRadius: "50%",
                  border: `${Math.max(1.5, 3 * z)}px solid rgba(126,203,255,0.9)`,
                  background: "rgba(126,203,255,0.12)",
                  boxShadow: `0 0 ${14 * z}px rgba(126,203,255,0.55)`,
                  opacity: now - g.shieldHitAt < 0.2 ? 1 : 0.55,
                }}
              />
            )}
            <PixelSprite sprite={SPRITES.castle} px={11 * castleScale * z} />
            {now - g.castleHitAt < 0.12 && (
              <div
                className="absolute inset-0"
                style={{ background: "rgba(255,60,60,0.55)", mixBlendMode: "screen" }}
              />
            )}
          </div>

          {/* turrets on the walls — rotate to follow your aim */}
          {Array.from({ length: g.turrets }, (_, i) => {
            const tp = scaledPos(TURRET_POS[i], castleScale);
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${S(tp.x)}%`,
                  top: `${S(tp.y)}%`,
                  transform: "translate(-50%,-50%)",
                }}
              >
                <div
                  style={{
                    transform: `rotate(${g.turretAngles[i]}deg)`,
                    transformOrigin: "center center",
                  }}
                >
                  <PixelSprite sprite={SPRITES.turret} px={5 * castleScale * z} />
                </div>
              </div>
            );
          })}

          {/* ground archers flanking the castle — rotate to follow your aim */}
          {Array.from({ length: g.archers }, (_, i) => {
            const ap = scaledPos(ARCHER_POS[i], castleScale);
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${S(ap.x)}%`,
                  top: `${S(ap.y)}%`,
                  transform: "translate(-50%,-50%)",
                }}
              >
                <div
                  style={{
                    transform: `rotate(${g.archerAngles[i]}deg)`,
                    transformOrigin: "center center",
                  }}
                >
                  <PixelSprite sprite={SPRITES.archer} px={4 * z} />
                </div>
              </div>
            );
          })}

          {/* earthworm turrets in the dirt — they hunt the tunnelers */}
          {Array.from({ length: g.worms }, (_, i) => {
            const wp = scaledPos(WORM_POS[i], castleScale);
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${S(wp.x)}%`,
                  top: `${S(wp.y)}%`,
                  transform: "translate(-50%,-50%)",
                }}
              >
                <PixelSprite sprite={SPRITES.worm} px={4 * castleScale * z} />
              </div>
            );
          })}

          {/* enemies */}
          {g.enemies.map((e) => {
            const st = KIND_STATS[e.kind];
            const dead = e.dying != null;
            const dprog = dead ? Math.min(1, (now - (e.dying ?? 0)) / 0.22) : 0;
            const flash = now - e.hitAt < 0.09;
            const walk = Math.abs(Math.sin(now * 9 + e.id * 1.7));
            const waddle = Math.sin(now * 9 + e.id * 1.7) * 4;
            const flying =
              e.kind === "dragon" ||
              e.kind === "gargoyle" ||
              e.kind === "crepe" ||
              e.kind === "crepewraith" ||
              e.kind === "wyvern" ||
              e.kind === "bat";
            const bob =
              e.kind === "gargoyle"
                ? Math.sin(now * 3.5 + e.id) * 4
                : e.kind === "wolf"
                ? Math.abs(Math.sin(now * 14 + e.id * 1.7)) * 3
                : flying
                ? Math.sin(now * 3 + e.id) * 4
                : walk * 3;
            const rot = flying ? 0 : e.kind === "wolf" ? Math.sin(now * 14 + e.id * 1.7) * 5 : waddle;
            /* lunge toward the keep when the enemy attacks it */
            const lAge = now - e.atkAt;
            const lunge = e.atkAt > 0 && lAge < 0.25 ? ((1 - lAge / 0.25) * 5 * z) : 0;
            const ldx = CASTLE.x - e.x;
            const ldy = CASTLE.y - e.y;
            const ld = Math.hypot(ldx, ldy) || 1;
            return (
              <div
                key={e.id}
                style={{
                  position: "absolute",
                  left: `${S(e.x)}%`,
                  top: `${S(e.y)}%`,
                  transform: `translate(calc(-50% + ${(ldx / ld) * lunge}px), calc(-50% + ${(ldy / ld) * lunge}px))`,
                  width: (st.size + 18) * z,
                  height: (st.size + 18) * z,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                {!dead && e.hp < e.maxHp && (
                  <div
                    style={{
                      position: "absolute",
                      top: -6,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: st.size * z,
                      height: 6,
                      background: "#000",
                      border: "2px solid #000",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.max(0, (e.hp / e.maxHp) * 100)}%`,
                        height: "100%",
                        background: e.hp / e.maxHp > 0.5 ? "#4caf50" : "#d9433b",
                      }}
                    />
                  </div>
                )}
                <div
                  style={{
                    transform: `translateY(${-bob}px) rotate(${rot}deg) scaleX(${e.face}) scale(${
                      1 - dprog * 0.4
                    })`,
                    opacity: 1 - dprog,
                    filter: flash ? "brightness(3) saturate(0)" : undefined,
                  }}
                >
                  <PixelSprite sprite={SPRITES[e.kind]} px={st.px * z} />
                </div>
              </div>
            );
          })}

          {/* arrows in flight */}
          {g.arrows.map((a) => {
            const ang = (Math.atan2(a.vy * aspectRef.current, a.vx) * 180) / Math.PI;
            return (
              <div
                key={a.id}
                style={{
                  position: "absolute",
                  left: `${S(a.x)}%`,
                  top: `${S(a.y)}%`,
                  width: 20 * z,
                  height: 3 * z,
                  background: a.tint,
                  boxShadow: a.tint === "#ff5b4d" ? "0 0 6px #ff5b4d" : "0 0 3px #000",
                  transform: `translate(-50%,-50%) rotate(${ang}deg)`,
                }}
              />
            );
          })}

          {/* kill particles */}
          {g.parts.map((pt) => {
            const age = now - pt.born;
            return (
              <div
                key={pt.id}
                style={{
                  position: "absolute",
                  left: `${S(pt.x)}%`,
                  top: `${S(pt.y)}%`,
                  width: pt.size * z,
                  height: pt.size * z,
                  background: pt.color,
                  transform: "translate(-50%,-50%)",
                  opacity: Math.max(0, 1 - age / 0.55),
                }}
              />
            );
          })}

          {/* coins flying to the gold counter */}
          {g.coins.map((c) => {
            const p = Math.min(1, (now - c.born) / 0.5);
            const ease = p * p * (3 - 2 * p);
            const x0 = S(c.x);
            const y0 = S(c.y);
            const x = x0 + (88 - x0) * ease;
            const y = y0 + (10 - y0) * ease;
            return (
              <div
                key={c.id}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${y}%`,
                  width: 9,
                  height: 9,
                  background: "#ffd24a",
                  border: "2px solid #8a5a00",
                  borderRadius: "50%",
                  transform: `translate(-50%,-50%) scale(${1 - p * 0.4})`,
                  opacity: 1 - p * 0.5,
                }}
              />
            );
          })}

          {/* damage pops */}
          {g.pops.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${S(p.x)}%`,
                top: `${S(p.y)}%`,
                color: p.color,
                fontSize: Math.max(8, 11 * z),
                fontWeight: "bold",
                textShadow: "0 2px 0 #000",
                animation: "popfloat 0.7s forwards",
                whiteSpace: "nowrap",
              }}
            >
              {p.text}
            </div>
          ))}

          {/* range ring: how far your arrows can fly from the castle */}
          {phase === "playing" && (
            <div
              style={{
                position: "absolute",
                left: `${S(CASTLE.x)}%`,
                top: `${S(CASTLE.y)}%`,
                width: `${g.range * 2 * z}%`,
                height: `${((g.range * 2 * z) / aspectRef.current)}%`,
                transform: "translate(-50%,-50%)",
                borderRadius: "50%",
                border: "2px dashed rgba(247,164,29,0.4)",
                pointerEvents: "none",
              }}
            />
          )}

          {/* crosshair */}
          {phase === "playing" && g.hold && (
            <div
              style={{
                position: "absolute",
                left: `${S(g.hold.x)}%`,
                top: `${S(g.hold.y)}%`,
                width: 34,
                height: 34,
                border: "3px solid " + (aimOut ? "rgba(255,255,255,0.35)" : "#f7a41d"),
                borderRadius: "50%",
                boxShadow: "0 0 0 2px #000, 0 0 8px rgba(247,164,29,0.6)",
                animation: "crossspin 1.2s linear infinite",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 6,
                  height: 6,
                  background: aimOut ? "rgba(255,255,255,0.35)" : "#f7a41d",
                  transform: "translate(-50%,-50%)",
                }}
              />
            </div>
          )}

          {/* shop perk toggles — bottom right (AUTO, 3×, 2×) */}
          {phase === "playing" &&
            (meta.speed > 0 || meta.x3 > 0 || meta.autoshoot > 0) && (
            <div
              className="absolute bottom-3 right-3 flex flex-col gap-2"
              style={{ pointerEvents: "auto" }}
            >
              {meta.autoshoot > 0 && (
                <button
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const gg = gRef.current!;
                    gg.autoOn = !gg.autoOn;
                    beep(gg.autoOn ? 980 : 300, 0.05);
                    setTick((t) => t + 1);
                  }}
                  className="text-[10px] font-bold"
                  style={{
                    background: g.autoOn ? "#ffd24a" : "#262b44",
                    color: g.autoOn ? "#000" : "#ffd24a",
                    border: "3px solid #000",
                    padding: "7px 10px",
                    boxShadow: "0 3px 0 #000",
                    touchAction: "manipulation",
                  }}
                >
                  AUTO {g.autoOn ? "ON" : "OFF"}
                </button>
              )}
              {meta.x3 > 0 && (
                <button
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const gg = gRef.current!;
                    gg.speed3 = !gg.speed3;
                    if (gg.speed3) gg.speedOn = false;
                    beep(gg.speed3 ? 1180 : 300, 0.05);
                    setTick((t) => t + 1);
                  }}
                  className="text-[10px] font-bold"
                  style={{
                    background: g.speed3 ? "#ffd24a" : "#262b44",
                    color: g.speed3 ? "#000" : "#ffd24a",
                    border: "3px solid #000",
                    padding: "7px 10px",
                    boxShadow: "0 3px 0 #000",
                    touchAction: "manipulation",
                  }}
                >
                  3× {g.speed3 ? "ON" : "OFF"}
                </button>
              )}
              {meta.speed > 0 && (
                <button
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const gg = gRef.current!;
                    gg.speedOn = !gg.speedOn;
                    if (gg.speedOn) gg.speed3 = false;
                    beep(gg.speedOn ? 980 : 300, 0.05);
                    setTick((t) => t + 1);
                  }}
                  className="text-[10px] font-bold"
                  style={{
                    background: g.speedOn ? "#ffd24a" : "#262b44",
                    color: g.speedOn ? "#000" : "#ffd24a",
                    border: "3px solid #000",
                    padding: "7px 10px",
                    boxShadow: "0 3px 0 #000",
                    touchAction: "manipulation",
                  }}
                >
                  2× {g.speedOn ? "ON" : "OFF"}
                </button>
              )}
            </div>
          )}

          {/* HUD — sits below the HP line */}
          <div className="absolute top-6 left-0 right-0 flex items-start justify-between p-2 text-[10px] pointer-events-none">
            <div className="flex flex-col gap-1">
              <div
                className="border-2 border-black px-2 py-1"
                style={{ background: "#262b44", color: "#f7a41d" }}
              >
                {waveLabel(g.wave)}
              </div>
              {/* shop & upgrades on demand — pauses the fight while browsing,
                  plus the pause button underneath */}
              {phase === "playing" && (
                <div className="flex flex-col gap-1" style={{ pointerEvents: "auto" }}>
                  <div className="flex gap-1">
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => setTab("shop")}
                      className="border-2 border-black px-2 py-1 text-[8px] font-bold"
                      style={{
                        background: tab === "shop" ? "#ffd24a" : "#262b44",
                        color: tab === "shop" ? "#000" : "#8d99ae",
                      }}
                    >
                      ⛒ SHOP
                    </button>
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => setTab("upgrades")}
                      className="border-2 border-black px-2 py-1 text-[8px] font-bold"
                      style={{
                        background: tab === "upgrades" ? "#ffd24a" : "#262b44",
                        color: tab === "upgrades" ? "#000" : "#8d99ae",
                      }}
                    >
                      ⚒ UPGRADES
                    </button>
                  </div>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => {
                      setPaused(true);
                      beep(523, 0.05);
                    }}
                    className="border-2 border-black px-2 py-1 text-[8px] font-bold"
                    style={{ background: "#262b44", color: "#8d99ae" }}
                  >
                    ⏸ PAUSE
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <div
                className="border-2 border-black px-2 py-1 flex items-center gap-2"
                style={{ background: "#262b44" }}
              >
                <span className="text-[8px] text-white/60">SCORE</span>
                <PixelSprite sprite={SPRITES.star} px={2} />
                <span className="text-white">{g.score}</span>
              </div>
              <div
                className="border-2 border-black px-2 py-1 flex items-center gap-2"
                style={{
                  background: "#262b44",
                  transform:
                    now < g.goldPulseUntil
                      ? `scale(${1 + 0.3 * Math.abs(Math.sin(now * 18))})`
                      : "scale(1)",
                  transformOrigin: "right center",
                }}
              >
                <span className="text-[8px] text-white/60">GOLD</span>
                <PixelSprite sprite={SPRITES.coin} px={2} />
                <span className="text-[#ffd24a]">{g.gold}</span>
              </div>
              <div
                className="border-2 border-black px-2 py-1 flex items-center gap-2"
                style={{ background: "#262b44" }}
              >
                <span className="text-[8px] text-white/60">RUBIES</span>
                <span className="text-[#ff4d6d]">♦</span>
                <span className="text-[#ff8fa3]">{meta.rubies}</span>
              </div>
            </div>
          </div>

          {/* castle HP bar — a full-width top line above every HUD button */}
          <div
            className="absolute top-0 left-0 right-0 flex items-center gap-2 p-1 pointer-events-none"
          >
            <span className="text-[9px] text-white" style={{ textShadow: "0 1px 0 #000" }}>
              ♥
            </span>
            <div className="flex-1 border-2 border-black h-3" style={{ background: "#000" }}>
              <div
                style={{
                  width: `${hpRatio * 100}%`,
                  height: "100%",
                  background: hpColor,
                  transition: "width 0.15s",
                }}
              />
            </div>
            <span className="text-[9px] text-white" style={{ textShadow: "0 1px 0 #000" }}>
              {g.hp}/{g.maxHp}
            </span>
            {g.shield > 0 && (
              <span
                className="text-[9px]"
                style={{ color: "#7ecbff", textShadow: "0 1px 0 #000" }}
              >
                ⛨ {g.shield}
              </span>
            )}
          </div>

          {/* wave banner */}
          {phase === "playing" && now < g.waveBannerUntil && (
            <div
              className="absolute text-2xl pointer-events-none"
              style={{
                left: "50%",
                top: "30%",
                color: "#f7a41d",
                textShadow: "0 3px 0 #000",
                animation: "bannerflash 0.5s infinite",
                transform: "translate(-50%,-50%)",
              }}
            >
              {waveLabel(g.wave)}
            </div>
          )}

          {/* boss banner */}
          {phase === "playing" && now < g.waveBannerUntil && boss && (
            <div
              className="absolute text-xs pointer-events-none"
              style={{
                left: "50%",
                top: "38%",
                color: "#ff5b4d",
                textShadow: "0 2px 0 #000",
                animation: "bannerflash 0.5s infinite",
                transform: "translate(-50%,-50%)",
              }}
            >
              BOSS: {boss.name}
            </div>
          )}

          {/* CRT scanlines */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(rgba(0,0,0,0.13) 0 2px, transparent 2px 4px)",
            }}
          />
        </div>

        {/* ----- overlays ----- */}
        {phase === "menu" && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              background: "linear-gradient(#0b0e1e 0%, #131a38 55%, #232a52 100%)",
              animation: "fadein 0.7s ease-out 2.6s both",
            }}
          >
            {/* living night scene: stars, shooting stars, big moon, clouds, the keep, pines */}
            {[
              [6, 10], [14, 5], [22, 16], [30, 8], [38, 13], [47, 6],
              [55, 15], [63, 9], [71, 14], [79, 6], [87, 11], [94, 8],
              [10, 22], [42, 21], [68, 22], [90, 19],
            ].map(([x, y], i) => (
              <div
                key={"mstar" + i}
                className="absolute bg-white"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: i % 3 === 0 ? 4 : 3,
                  height: i % 3 === 0 ? 4 : 3,
                  animation: `twinkle ${1.4 + (i % 5) * 0.7}s infinite`,
                }}
              />
            ))}
            {[
              { left: "8%", top: "5%", dur: 9, delay: 0 },
              { left: "46%", top: "3%", dur: 13, delay: 5 },
              { left: "24%", top: "11%", dur: 10, delay: 8 },
            ].map((s, i) => (
              <div
                key={"mshoot" + i}
                className="absolute"
                style={{
                  left: s.left,
                  top: s.top,
                  width: 46,
                  height: 2,
                  background: "linear-gradient(90deg, rgba(255,255,255,0.95), transparent)",
                  opacity: 0,
                  animation: `shoot ${s.dur}s linear ${s.delay}s infinite`,
                }}
              />
            ))}
            <div
              className="absolute"
              style={{
                left: "70%",
                top: "4%",
                filter: "drop-shadow(0 0 22px rgba(247,164,29,0.45))",
              }}
            >
              <PixelSprite sprite={SPRITES.moon} px={9} />
            </div>
            {[
              { top: "16%", dur: 46 },
              { top: "26%", dur: 34 },
              { top: "36%", dur: 58 },
            ].map((c, i) => (
              <div
                key={"mcloud" + i}
                className="absolute"
                style={{
                  top: c.top,
                  left: 0,
                  width: "16%",
                  height: "5%",
                  borderRadius: 999,
                  background: "rgba(141,154,174,0.22)",
                  animation: `drift ${c.dur}s linear infinite`,
                }}
              />
            ))}
            <div
              className="absolute"
              style={{
                left: "50%",
                bottom: "14%",
                transform: "translateX(-50%)",
                filter: "drop-shadow(0 0 12px rgba(247,164,29,0.3))",
                animation: "floaty 5s ease-in-out infinite",
              }}
            >
              <PixelSprite sprite={SPRITES.castle} px={7} />
            </div>
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{ height: "16%", background: "#0e2416" }}
            >
              {[-8, 4, 14, 26, 38, 50, 62, 74, 86, 96, 108].map((x, i) => (
                <div key={"mpine" + i} className="absolute" style={{ left: `${x}%`, bottom: "8%" }}>
                  <PixelSprite sprite={SPRITES.pine} px={4} />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                className="flex flex-col items-center gap-3 border-4 border-black p-6 max-w-[320px] w-full max-h-[94%]"
                style={{
                  background: "rgba(20,24,44,0.92)",
                  animation: "floaty 4s ease-in-out infinite",
                }}
              >
                <div
                  className="text-[#f7a41d] text-2xl"
                  style={{ textShadow: "0 4px 0 #000, 0 0 18px rgba(247,164,29,0.45)" }}
                >
                  PIXEL KEEP
                </div>
                <div className="text-[9px] text-[#8d99ae] -mt-1">
                  hold the line — one arrow at a time
                </div>
                <div className="text-[10px] text-white/80 text-center leading-5 pt-1">
                  ★ BEST: {best}
                  <br />
                  <span className="text-[#ffd24a]">⛁ {meta.gold} gold</span> •{" "}
                  <span className="text-[#ff8fa3]">♦ {meta.rubies} rubies</span>
                </div>
                <PixButton color="#4caf50" onClick={playPressed}>
                  ▶ PLAY
                </PixButton>
                <div className="flex flex-wrap gap-2 justify-center">
                  <PixButton
                    small
                    color="#8d6742"
                    onClick={() => {
                      ensureAudio();
                      setMenuShop(true);
                    }}
                  >
                    ⛒ SHOP
                  </PixButton>
                  <PixButton
                    small
                    color="#8d6742"
                    onClick={() => {
                      ensureAudio();
                      setShowArmory(true);
                    }}
                  >
                    ◆ ARMORY
                  </PixButton>
                  <PixButton
                    small
                    color="#8d6742"
                    onClick={() => {
                      ensureAudio();
                      setShowSettings(true);
                    }}
                  >
                    ⚙ SETTINGS
                  </PixButton>
                </div>
                <span
                  className="text-[8px] text-white/40"
                  style={{ animation: "blink 1.2s infinite" }}
                >
                  hold &amp; drag anywhere to aim your rain of arrows
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ----- studio splash: logo on black at launch, fades into the menu ----- */}
        {splash && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: "#000",
              zIndex: 60,
              animation: "splashout 0.6s ease-in 2.4s forwards",
            }}
          >
            <div
              className="flex flex-col items-center border-4 px-10 py-8"
              style={{
                borderColor: "#f7a41d",
                background: "#000",
                animation: "logoin 0.9s ease-out both",
              }}
            >
              <div className="text-white text-lg tracking-wide">SekaFaji.</div>
              <div className="text-[#f7a41d] text-xl tracking-[0.4em] mt-2">GAMES</div>
            </div>
          </div>
        )}

        {/* ----- how to play: shown the first time the player presses PLAY ----- */}
        {showHowTo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4">
            <div
              className="flex flex-col items-center gap-3 border-4 border-black p-4 max-w-[320px] w-full max-h-[94%] overflow-y-auto"
              style={{ background: "#1c2138" }}
            >
              <div
                className="text-[#ffd24a] text-base text-center"
                style={{ textShadow: "0 2px 0 #000" }}
              >
                ⚔ HOW TO DEFEND THE KEEP
              </div>
              {[
                ["🏹", "HOLD & DRAG anywhere — arrows fly toward your finger and stop only when they hit something"],
                ["🔴", "RED ARROWS are distance crits: ×2 damage and ×2 range"],
                ["☁️", "SKY enemies dive from above — turrets love them. GRUNTS march the grass — archers hunt them"],
                ["🕳️", "TUNNELERS strike from below in mid/late game — only EARTHWORM turrets can shoot them underground"],
                ["⭐", "BOSSES come every 5 waves and drop rubies — spend them in the SHOP on permanent perks"],
                ["⚒️", "Between waves, spend gold in UPGRADES: arrows, shields, turrets, archers & worms"],
              ].map(([icon, txt]) => (
                <div key={txt} className="w-full flex items-start gap-2">
                  <span className="text-sm w-5 text-center">{icon}</span>
                  <span className="text-[9px] text-white/85 leading-4">{txt}</span>
                </div>
              ))}
              <PixButton color="#4caf50" onClick={dismissHowTo}>
                GOT IT — DEFEND THE KEEP!
              </PixButton>
            </div>
          </div>
        )}

        {phase === "intermission" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/85 p-4">
            <div
              className="flex flex-col items-center gap-3 border-4 border-black p-4 max-w-[300px] w-full max-h-[94%] overflow-y-auto"
              style={{ background: "#262b44" }}
            >
              {/* shop / upgrades — buttons at the top left */}
              <div className="flex gap-2 self-start w-full">
                <PixButton
                  small
                  color={tab === "shop" ? "#ffd24a" : "#8d99ae"}
                  onClick={() => setTab(tab === "shop" ? "none" : "shop")}
                >
                  ⛒ SHOP
                </PixButton>
                <PixButton
                  small
                  color={tab === "upgrades" ? "#ffd24a" : "#8d99ae"}
                  onClick={() => setTab(tab === "upgrades" ? "none" : "upgrades")}
                >
                  ⚒ UPGRADES
                </PixButton>
              </div>

              <div className="text-[#4caf50] text-sm" style={{ textShadow: "0 2px 0 #000" }}>
                {waveLabel(g.wave)} CLEARED!
              </div>
              <div className="text-[10px] text-[#ffd24a]">+{g.lastBonus} gold bonus</div>
              <div className="text-[9px] text-white/70 text-center leading-4">
                Arrows: {g.damage} dmg • Pierce: {Math.round(g.pierce * 100)}% • Castle: {g.hp}/
                {g.maxHp} HP
                <br />
                Range: {Math.round(g.range)} • Dist-crit: {Math.round(g.dCritChance * 100)}% •
                Turrets: {g.turrets}/{MAX_TURRETS} • Archers: {g.archers}/{MAX_ARCHERS}
              </div>
              {autoNextIn > 0 && (
                <div
                  className="text-[9px] text-white/60"
                  style={{ animation: "blink 1s infinite" }}
                >
                  next wave in {autoNextIn}s…
                </div>
              )}
              <PixButton color="#d9433b" onClick={() => { ensureAudio(); startWave(g.wave + 1); }}>
                {waveLabel(g.wave + 1)} ▶
              </PixButton>
              <PixButton small color="#8d6742" onClick={() => setQuitWarn(true)}>
                ⌂ MAIN MENU
              </PixButton>
            </div>
          </div>
        )}

        {/* ----- pause menu (during a wave) ----- */}
        {paused && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/90 p-4"
            style={{ zIndex: 50 }}
          >
            <div
              className="flex flex-col items-center gap-3 border-4 border-black p-4 max-w-[300px] w-full"
              style={{ background: "#1c2138" }}
            >
              <div
                className="text-[#ffd24a] text-sm text-center"
                style={{ textShadow: "0 2px 0 #000" }}
              >
                ⏸ PAUSED
              </div>
              <p className="text-[8px] text-white/50 text-center leading-4">
                The siege holds its breath — enemies, turrets and arrows all wait for you.
              </p>
              <PixButton color="#4caf50" onClick={() => setPaused(false)}>
                ▶ RESUME
              </PixButton>
              <PixButton color="#d9433b" small onClick={() => setQuitWarn(true)}>
                ⌂ MAIN MENU
              </PixButton>
            </div>
          </div>
        )}

        {/* ----- quitting a run to the menu warns first ----- */}
        {quitWarn && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/90 p-4"
            style={{ zIndex: 52 }}
          >
            <div
              className="flex flex-col items-center gap-3 border-4 border-black p-4 max-w-[300px] w-full"
              style={{ background: "#1c2138" }}
            >
              <div
                className="text-[#ff8fa3] text-sm text-center"
                style={{ textShadow: "0 2px 0 #000" }}
              >
                ⚠ LEAVE THIS RUN?
              </div>
              <p className="text-[8px] text-white/60 text-center leading-4">
                Quitting to the main menu will lose your current run — score, gold, upgrades
                and wave progress from this siege are gone for good.
              </p>
              <PixButton color="#4caf50" small onClick={() => setQuitWarn(false)}>
                KEEP DEFENDING
              </PixButton>
              <PixButton color="#d9433b" small onClick={goMenu}>
                QUIT TO MENU
              </PixButton>
            </div>
          </div>
        )}

        {/* ----- shop: ruby packs + premium perks, in scrollable tabs ----- */}
        {/* ----- settings: general / sound / about ----- */}
        {showSettings && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/90 p-4"
            style={{ zIndex: 45 }}
          >
            <div
              className="flex flex-col border-4 border-black p-4 max-w-[300px] w-full max-h-[94%]"
              style={{ background: "#1c2138" }}
            >
              <div
                className="text-[#8d99ae] text-sm text-center"
                style={{ textShadow: "0 2px 0 #000" }}
              >
                ⚙ SETTINGS
              </div>
              <div className="flex gap-2 justify-center py-2">
                <PixButton
                  small
                  color={settingsTab === "general" ? "#ffd24a" : "#8d99ae"}
                  onClick={() => setSettingsTab("general")}
                >
                  ★ GENERAL
                </PixButton>
                <PixButton
                  small
                  color={settingsTab === "sound" ? "#ffd24a" : "#8d99ae"}
                  onClick={() => setSettingsTab("sound")}
                >
                  🔊 SOUND
                </PixButton>
                <PixButton
                  small
                  color={settingsTab === "about" ? "#ffd24a" : "#8d99ae"}
                  onClick={() => setSettingsTab("about")}
                >
                  ♦ ABOUT
                </PixButton>
              </div>
              <div
                className="scrollbox overflow-y-auto flex flex-col items-center gap-2 py-2 px-1 border-4 border-black"
                style={{ height: 220, background: "#262b44" }}
              >
                {settingsTab === "general" && (
                  <>
                    <p className="text-[8px] text-white/50 text-center leading-4">
                      Restore rubies and perks linked to this device, or read our privacy policy.
                    </p>
                    <UpgradeCard
                      icon="↻"
                      name="RESTORE PURCHASES"
                      desc="Re-load every ruby pack and perk linked to this device."
                      cost="FREE"
                      action="RESTORE"
                      onClick={restorePurchases}
                    />
                    {restoreMsg && (
                      <div className="text-[9px] text-[#4caf50] text-center">{restoreMsg}</div>
                    )}
                    <UpgradeCard
                      icon="📜"
                      name="PRIVACY POLICY"
                      desc="What the keep knows about you — and it isn't much."
                      cost="DOC"
                      action="READ"
                      onClick={() => setShowPrivacy(true)}
                    />
                  </>
                )}
                {settingsTab === "sound" && (
                  <>
                    <p className="text-[8px] text-white/50 text-center leading-4">
                      Every beep, twang and explosion in the keep.
                    </p>
                    <UpgradeCard
                      icon="🔊"
                      name="SOUND"
                      desc="Toggle all combat and menu sounds. Saved between sessions."
                      cost={soundOn ? "ON" : "OFF"}
                      action={soundOn ? "MUTE" : "UNMUTE"}
                      onClick={toggleSound}
                    />
                    <UpgradeCard
                      icon="▶"
                      name="TEST SOUND"
                      desc="Play a short fanfare to check your volume."
                      cost="FREE"
                      action="PLAY"
                      onClick={() => {
                        ensureAudio();
                        beep(660, 0.1);
                        setTimeout(() => beep(880, 0.12), 110);
                      }}
                    />
                  </>
                )}
                {settingsTab === "about" && (
                  <>
                    <div className="text-[10px] text-white text-center leading-5">
                      PIXEL KEEP <span className="text-white/50">v1.0</span>
                    </div>
                    <div className="text-[9px] text-[#f7a41d] text-center leading-5">
                      a SekaFaji Games production
                    </div>
                    <div className="text-[8px] text-white/60 text-center leading-4">
                      Design • Code • Pixels — SekaFaji Games
                    </div>
                    <div className="text-[8px] text-white/40 text-center leading-4">
                      Huge thanks to every keeper who tested the walls.
                    </div>
                    <div className="text-[8px] text-white/40 text-center leading-4">
                      ⛒ Ruby packs • ♦ Perks • 🪱 Earthworms — all in a day's siege.
                    </div>
                  </>
                )}
              </div>
              <PixButton
                color="#d9433b"
                small
                onClick={() => {
                  setShowSettings(false);
                  setRestoreMsg("");
                }}
              >
                CLOSE
              </PixButton>
            </div>
          </div>
        )}

        {/* ----- privacy policy ----- */}
        {showPrivacy && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/90 p-4"
            style={{ zIndex: 55 }}
          >
            <div
              className="flex flex-col border-4 border-black p-4 max-w-[300px] w-full max-h-[94%]"
              style={{ background: "#1c2138" }}
            >
              <div
                className="text-[#ffd24a] text-sm text-center"
                style={{ textShadow: "0 2px 0 #000" }}
              >
                📜 PRIVACY POLICY
              </div>
              <div
                className="scrollbox overflow-y-auto flex flex-col gap-2 py-2 px-1 border-4 border-black"
                style={{ height: 240, background: "#262b44" }}
              >
                <p className="text-[8px] text-white/70 leading-4">
                  Pixel Keep is built by SekaFaji Games. We do not collect, store, or share any
                  personal data.
                </p>
                <p className="text-[8px] text-white/70 leading-4">
                  Your progress, gold, and rubies live only on your device (local storage). Nothing
                  leaves it.
                </p>
                <p className="text-[8px] text-white/70 leading-4">
                  When the game launches, purchases will be processed by Google Play — Google's own
                  privacy policy applies to payment details. We never see your identity, contacts,
                  or location.
                </p>
                <p className="text-[8px] text-white/40 leading-4">
                  Questions? Reach out to SekaFaji Games. (Placeholder text — update it with your
                  contact email and store listing before release.)
                </p>
              </div>
              <PixButton color="#d9433b" small onClick={() => setShowPrivacy(false)}>
                BACK
              </PixButton>
            </div>
          </div>
        )}

        {(tab === "shop" || menuShop) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4">
            <div
              className="flex flex-col border-4 border-black p-4 max-w-[300px] w-full max-h-[94%]"
              style={{ background: "#1c2138" }}
            >
              <div className="text-[#ffd24a] text-sm text-center" style={{ textShadow: "0 2px 0 #000" }}>
                ⛒ KEEP SHOP
              </div>
              <div className="text-[10px] text-[#ff8fa3] text-center">♦ {meta.rubies} RUBIES</div>
              <div className="flex gap-2 justify-center py-2">
                <PixButton
                  small
                  color={shopTab === "rubies" ? "#ffd24a" : "#8d99ae"}
                  onClick={() => setShopTab("rubies")}
                >
                  ♦ PACKS
                </PixButton>
                <PixButton
                  small
                  color={shopTab === "perks" ? "#ffd24a" : "#8d99ae"}
                  onClick={() => setShopTab("perks")}
                >
                  ★ PERKS
                </PixButton>
              </div>
              <div className="scrollbox flex-1 min-h-0 overflow-y-auto flex flex-col items-center gap-2 py-2 px-1 border-4 border-black" style={{ background: "#262b44" }}>
                {shopTab === "rubies" ? (
                  <>
                    <p className="text-[8px] text-white/50 text-center leading-4">
                      Packs are free while we test — they will cost real money at launch.
                      Bosses also drop a few rubies on their own.
                    </p>
                    {RUBY_PACKS.map((p) => (
                      <UpgradeCard
                        key={p.name}
                        icon={p.name.startsWith("POUCH") ? "🎒" : p.name.startsWith("CHEST") ? "🧰" : "🏦"}
                        name={p.name}
                        desc={`+${p.rubies} rubies for perks and premium toggles.`}
                        cost={`${p.price} — FREE`}
                        onClick={() => buyRubyPack(p.rubies)}
                      />
                    ))}
                  </>
                ) : (
                  <>
                    <p className="text-[8px] text-white/50 text-center leading-4">
                      Permanent unlocks paid in rubies — yours forever.
                    </p>
                    {PERKS.map((p) => {
                      const owned = meta[p.key] > 0;
                      return (
                        <UpgradeCard
                          key={p.key}
                          icon="★"
                          name={p.name}
                          desc={p.desc}
                          cost={`${p.cost} ♦`}
                          disabled={meta.rubies < p.cost}
                          done={owned ? "OWNED" : undefined}
                          onClick={() => buyPerk(p.key, p.cost)}
                        />
                      );
                    })}
                  </>
                )}
              </div>
              <PixButton color="#d9433b" onClick={() => { setTab("none"); setMenuShop(false); }}>
                CLOSE
              </PixButton>
            </div>
          </div>
        )}

        {/* ----- upgrades: one tab per branch, all tabs the same fixed size ----- */}
        {tab === "upgrades" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4">
            <div
              className="flex flex-col border-4 border-black p-4 max-w-[300px] w-full max-h-[94%]"
              style={{ background: "#1c2138" }}
            >
              <div className="text-[#f7a41d] text-sm text-center" style={{ textShadow: "0 2px 0 #000" }}>
                ⚒ UPGRADES
              </div>
              <div className="text-[10px] text-[#ffd24a] text-center">⛁ {g.gold} GOLD</div>
              <div className="flex flex-wrap gap-1 justify-center py-2">
                <PixButton
                  small
                  color={upTab === "arrows" ? "#ffd24a" : "#8d99ae"}
                  onClick={() => setUpTab("arrows")}
                >
                  ⚔ ATTACK
                </PixButton>
                <PixButton
                  small
                  color={upTab === "defense" ? "#ffd24a" : "#8d99ae"}
                  onClick={() => setUpTab("defense")}
                >
                  ⛨ DEFENSE
                </PixButton>
                <PixButton
                  small
                  color={g.turrets < 1 ? "#3a3f58" : upTab === "turrets" ? "#ffd24a" : "#8d99ae"}
                  onClick={() => setUpTab("turrets")}
                >
                  ⟠ TURRETS{g.turrets < 1 ? " 🔒" : ""}
                </PixButton>
                <PixButton
                  small
                  color={g.archers < 1 ? "#3a3f58" : upTab === "archers" ? "#ffd24a" : "#8d99ae"}
                  onClick={() => setUpTab("archers")}
                >
                  ➶ ARCHERS{g.archers < 1 ? " 🔒" : ""}
                </PixButton>
                <PixButton
                  small
                  color={g.worms < 1 ? "#3a3f58" : upTab === "worms" ? "#ffd24a" : "#8d99ae"}
                  onClick={() => setUpTab("worms")}
                >
                  🪱 WORMS{g.worms < 1 ? " 🔒" : ""}
                </PixButton>
              </div>
              <div
                className="scrollbox overflow-y-auto flex flex-col items-center gap-2 py-2 px-1 border-4 border-black"
                style={{ height: 240, background: "#262b44" }}
              >
                {upTab === "arrows" && (
                  <>
                    <UpgradeCard
                      icon="⚔"
                      name={`SHARPEN ARROWS — DMG ${g.damage}`}
                      desc="Heavier heads: every arrow from your keep deals +1 damage."
                      cost={`${dmgCost}g`}
                      disabled={g.gold < dmgCost}
                      onClick={buyDamage}
                    />
                    <UpgradeCard
                      icon="➤"
                      name={`FLETCHING — LV ${g.rangeLvl}`}
                      desc="Better feathers: +12% flight range for all your arrows."
                      cost={`${fletchCost}g`}
                      disabled={g.gold < fletchCost}
                      onClick={buyFletching}
                    />
                    <UpgradeCard
                      icon="✦"
                      name={`EAGLE EYE — LV ${g.dCritLvl}`}
                      desc="+6% chance of a distance crit — red arrows fly twice as far and deal double damage."
                      cost={`${eagleCost}g`}
                      disabled={g.gold < eagleCost || g.dCritLvl >= 3}
                      done={g.dCritLvl >= 3 ? "MAXED" : undefined}
                      onClick={buyEagle}
                    />
                    <UpgradeCard
                      icon="✧"
                      name={`PIERCING TIPS — LV ${g.pierceLvl}`}
                      desc="+10% chance arrows punch straight through the first enemy and keep flying."
                      cost={`${pierceCost}g`}
                      disabled={g.gold < pierceCost || g.pierceLvl >= 5}
                      done={g.pierceLvl >= 5 ? "MAXED" : undefined}
                      onClick={buyPierce}
                    />
                    <UpgradeCard
                      icon="⚡"
                      name={`RAPID HANDS — LV ${g.rapidLvl}`}
                      desc="Faster loosing: your keep fires 15% quicker per level while you hold."
                      cost={`${lvCost(g.rapidLvl, 50, 35)}g`}
                      disabled={g.gold < lvCost(g.rapidLvl, 50, 35) || g.rapidLvl >= 3}
                      done={g.rapidLvl >= 3 ? "MAXED" : undefined}
                      onClick={() => buyLeveled("rapidLvl", 3, 50, 35)}
                    />
                    <UpgradeCard
                      icon="⧉"
                      name={`DOUBLE-STRING — LV ${g.doubleLvl}`}
                      desc="+8% chance per level to loose a second arrow with every single shot."
                      cost={`${lvCost(g.doubleLvl, 60, 45)}g`}
                      disabled={g.gold < lvCost(g.doubleLvl, 60, 45) || g.doubleLvl >= 3}
                      done={g.doubleLvl >= 3 ? "MAXED" : undefined}
                      onClick={() => buyLeveled("doubleLvl", 3, 60, 45)}
                    />
                  </>
                )}
                {upTab === "defense" && (
                  <>
                    <UpgradeCard
                      icon="▲"
                      name={`FORTIFY — LV ${g.fortLvl}`}
                      desc="Thicker walls: +20 max castle HP per level — and the keep grows a little taller."
                      cost={`${fortCost}g`}
                      disabled={g.gold < fortCost}
                      onClick={buyFortify}
                    />
                    <UpgradeCard
                      icon="✚"
                      name="REPAIR"
                      desc="Masons patch the cracks: restore 35 HP right now. Cheap and always useful."
                      cost="12g"
                      disabled={g.gold < 12 || g.hp >= g.maxHp}
                      done={g.hp >= g.maxHp ? "FULL HP" : undefined}
                      onClick={buyRepair}
                    />
                    <UpgradeCard
                      icon="⛨"
                      name={`FORCE SHIELD — LV ${g.shieldLvl}`}
                      desc="A bubble around the keep soaks 30 damage per level and fully regenerates between waves."
                      cost={`${shieldCost}g`}
                      disabled={g.gold < shieldCost || g.shieldLvl >= 3}
                      done={g.shieldLvl >= 3 ? "MAXED" : undefined}
                      onClick={buyShield}
                    />
                    <UpgradeCard
                      icon="🗡"
                      name={`THORNY WALLS — LV ${g.thornLvl}`}
                      desc="Spiked masonry zaps every enemy that bites your gate for 2 + 2×level damage."
                      cost={`${lvCost(g.thornLvl, 40, 30)}g`}
                      disabled={g.gold < lvCost(g.thornLvl, 40, 30) || g.thornLvl >= 3}
                      done={g.thornLvl >= 3 ? "MAXED" : undefined}
                      onClick={() => buyLeveled("thornLvl", 3, 40, 30)}
                    />
                  </>
                )}
                {upTab === "turrets" && (
                  <>
                    <UpgradeCard
                      icon="⟠"
                      name={`BUILD TURRET — ${g.turrets}/${MAX_TURRETS}`}
                      desc="A wall-mounted turret fires where you aim. With AUTO SHOOT it hunts the sky."
                      cost={`${turretCost}g`}
                      disabled={g.gold < turretCost || g.turrets >= MAX_TURRETS}
                      done={g.turrets >= MAX_TURRETS ? "ALL SLOTS FULL" : undefined}
                      onClick={buyTurret}
                    />
                    <UpgradeCard
                      icon="⬆"
                      name={`HEAVY BOLTS — LV ${g.turretDmgLvl}`}
                      desc="Dense iron bolts: +1 damage per level on every turret and worm shot."
                      cost={`${lvCost(g.turretDmgLvl, 40, 25)}g`}
                      disabled={g.gold < lvCost(g.turretDmgLvl, 40, 25) || g.turretDmgLvl >= 3}
                      done={g.turretDmgLvl >= 3 ? "MAXED" : undefined}
                      locked={g.turrets < 1 ? "BUILD A TURRET FIRST" : undefined}
                      onClick={() => buyLeveled("turretDmgLvl", 3, 40, 25)}
                    />
                    <UpgradeCard
                      icon="⚡"
                      name={`RAPID BARRELS — LV ${g.turretRateLvl}`}
                      desc="Oiled gears: turrets reload 20% faster per level."
                      cost={`${lvCost(g.turretRateLvl, 45, 30)}g`}
                      disabled={g.gold < lvCost(g.turretRateLvl, 45, 30) || g.turretRateLvl >= 3}
                      done={g.turretRateLvl >= 3 ? "MAXED" : undefined}
                      locked={g.turrets < 1 ? "BUILD A TURRET FIRST" : undefined}
                      onClick={() => buyLeveled("turretRateLvl", 3, 45, 30)}
                    />
                    <UpgradeCard
                      icon="➤"
                      name={`LONG BARRELS — LV ${g.turretRangeLvl}`}
                      desc="Extended barrels: +10% turret range per level."
                      cost={`${lvCost(g.turretRangeLvl, 40, 25)}g`}
                      disabled={g.gold < lvCost(g.turretRangeLvl, 40, 25) || g.turretRangeLvl >= 3}
                      done={g.turretRangeLvl >= 3 ? "MAXED" : undefined}
                      locked={g.turrets < 1 ? "BUILD A TURRET FIRST" : undefined}
                      onClick={() => buyLeveled("turretRangeLvl", 3, 40, 25)}
                    />
                  </>
                )}
                {upTab === "archers" && (
                  <>
                    <UpgradeCard
                      icon="➶"
                      name={`RECRUIT ARCHER — ${g.archers}/${MAX_ARCHERS}`}
                      desc="A ground archer flanks the keep and fires where you aim. With AUTO SHOOT they hunt the grass."
                      cost={`${archerCost}g`}
                      disabled={g.gold < archerCost || g.archers >= MAX_ARCHERS}
                      done={g.archers >= MAX_ARCHERS ? "ALL SLOTS FULL" : undefined}
                      onClick={buyArcher}
                    />
                    <UpgradeCard
                      icon="⬆"
                      name={`BROADHEADS — LV ${g.archerDmgLvl}`}
                      desc="Wider heads: +1 damage per level on every archer arrow."
                      cost={`${lvCost(g.archerDmgLvl, 40, 25)}g`}
                      disabled={g.gold < lvCost(g.archerDmgLvl, 40, 25) || g.archerDmgLvl >= 3}
                      done={g.archerDmgLvl >= 3 ? "MAXED" : undefined}
                      locked={g.archers < 1 ? "RECRUIT AN ARCHER FIRST" : undefined}
                      onClick={() => buyLeveled("archerDmgLvl", 3, 40, 25)}
                    />
                    <UpgradeCard
                      icon="⚡"
                      name={`QUICK DRAW — LV ${g.archerRateLvl}`}
                      desc="Fast hands: archers loose 20% more arrows per level."
                      cost={`${lvCost(g.archerRateLvl, 45, 30)}g`}
                      disabled={g.gold < lvCost(g.archerRateLvl, 45, 30) || g.archerRateLvl >= 3}
                      done={g.archerRateLvl >= 3 ? "MAXED" : undefined}
                      locked={g.archers < 1 ? "RECRUIT AN ARCHER FIRST" : undefined}
                      onClick={() => buyLeveled("archerRateLvl", 3, 45, 30)}
                    />
                    <UpgradeCard
                      icon="➤"
                      name={`EAGLE ARCHERS — LV ${g.archerRangeLvl}`}
                      desc="Sharper eyes: +10% archer range per level."
                      cost={`${lvCost(g.archerRangeLvl, 40, 25)}g`}
                      disabled={g.gold < lvCost(g.archerRangeLvl, 40, 25) || g.archerRangeLvl >= 3}
                      done={g.archerRangeLvl >= 3 ? "MAXED" : undefined}
                      locked={g.archers < 1 ? "RECRUIT AN ARCHER FIRST" : undefined}
                      onClick={() => buyLeveled("archerRangeLvl", 3, 40, 25)}
                    />
                  </>
                )}
                {upTab === "worms" && (
                  <>
                    <UpgradeCard
                      icon="🪱"
                      name={`BUILD EARTHWORM — ${g.worms}/${MAX_WORMS}`}
                      desc="A tunneling turret in the dirt — the ONLY unit that can shoot underground enemies. Moles arrive at wave 10!"
                      cost={`${wormCost}g`}
                      disabled={g.gold < wormCost || g.worms >= MAX_WORMS}
                      done={g.worms >= MAX_WORMS ? "ALL SLOTS FULL" : undefined}
                      onClick={buyWorm}
                    />
                    <UpgradeCard
                      icon="💡"
                      name="WORM TACTICS"
                      desc="Tunnelers burrow in from the flanks and hit your gate from below. Watch the dirt — if you see a mound moving, a worm turret can reach it."
                      cost=""
                      done="INFO"
                      locked={g.worms < 1 ? "BUILD A WORM FIRST" : undefined}
                    />
                  </>
                )}
              </div>
              <PixButton color="#d9433b" onClick={() => setTab("none")}>
                CLOSE
              </PixButton>
            </div>
          </div>
        )}

        {phase === "gameover" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/85 p-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-[#d9433b] text-base" style={{ textShadow: "0 3px 0 #000" }}>
                THE KEEP HAS FALLEN
              </div>
              <div className="text-[10px] text-white/85 leading-5">
                You held until {waveLabel(g.wave)}
                <br />
                Score: {g.score}
                <br />
                Best: {best}
                <br />
                <span className="text-[#ffd24a]">+{lastEarn} meta gold earned</span>
              </div>
              <PixButton color="#4caf50" onClick={startGame}>
                DEFEND AGAIN
              </PixButton>
              <div className="flex items-center justify-center gap-2">
                <PixButton color="#8d6742" small onClick={() => setShowArmory(true)}>
                  ◆ ARMORY
                </PixButton>
                <PixButton color="#d9433b" small onClick={goMenu}>
                  ⌂ MAIN MENU
                </PixButton>
              </div>
            </div>
          </div>
        )}

        {/* ----- armory (permanent upgrades) ----- */}
        {showArmory && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-4">
            <div
              className="flex flex-col items-center gap-3 border-4 border-black p-4 max-w-[320px] w-full max-h-[94%] overflow-y-auto"
              style={{ background: "#1c2138" }}
            >
              <div className="text-[#ffd24a] text-sm" style={{ textShadow: "0 2px 0 #000" }}>
                ◆ THE ARMORY
              </div>
              <div className="text-[10px] text-[#ffd24a]">◆ {meta.gold} META GOLD</div>
              <p className="text-[8px] text-white/50 text-center leading-4">
                Score from every run converts to meta gold. These upgrades are permanent.
              </p>
              {META_UPGRADES.map((u) => {
                const lvl = meta[u.key];
                const maxed = lvl >= u.costs.length;
                const cost = maxed ? 0 : u.costs[lvl];
                return (
                  <UpgradeCard
                    key={u.key}
                    icon={
                      u.key === "walls" ? "⛨" :
                      u.key === "fletcher" ? "➤" :
                      u.key === "longbow" ? "➶" :
                      u.key === "eagle" ? "✦" :
                      u.key === "chest" ? "⛁" : "⟠"
                    }
                    name={`${u.name} — ${"●".repeat(lvl)}${"○".repeat(u.costs.length - lvl)}`}
                    desc={u.desc}
                    cost={`${cost}◆`}
                    action="UPGRADE"
                    disabled={meta.gold < cost}
                    done={maxed ? "MAXED" : undefined}
                    onClick={() => buyMeta(u.key)}
                  />
                );
              })}
              <PixButton color="#d9433b" onClick={() => setShowArmory(false)}>
                CLOSE
              </PixButton>
            </div>
          </div>
        )}
      </div>

      <p className="hidden sm:block text-[8px] text-white/40 text-center max-w-[380px] leading-4">
        arrows carry on past your aim • red arrows = distance crits (2× range) • crits deal ×2 •
        boss every 5th wave • the map widens every level — FORTIFY grows your keep
      </p>
    </div>
  );
}