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
