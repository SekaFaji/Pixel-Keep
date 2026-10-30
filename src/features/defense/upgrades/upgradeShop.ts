import type { Game, Meta } from "../../../game/types";
import { saveMeta } from "../../../game/meta";

/**
 * A snapshot of the current in-run shop, rebuilt on each game render.
 * Purchase callbacks retain the original gameplay costs, sounds and timing.
 * No React dependency: this is the bridge from mutable combat state to UI data.
 */
interface UpgradeShopDependencies {
  gRef: { current: Game | null };
  metaRef: { current: Meta };
  setMeta: (value: Meta) => void;
  setTick: (update: (tick: number) => number) => void;
  beep: (freq: number, dur?: number, type?: OscillatorType, vol?: number) => void;
  ensureAudio: () => void;
}

export type UpgradeCategory = "bow" | "turret" | "archer" | "worm" | "castle";
export type UpgradeDefinition = {
  id: string;
  cat: UpgradeCategory;
  icon: string;
  short: string;
  name: string;
  desc: string;
  cost: number;
  buyable: boolean;
  done: boolean;
  doneTxt?: string;
  lockTxt?: string;
  buy: () => void;
};

export const levelUpgradeCost = (level: number, base: number, step: number) =>
  base + step * level;

export const UPGRADE_TABS: { key: UpgradeCategory; icon: string; name: string }[] = [
  { key: "bow", icon: "🏹", name: "BOW" },
  { key: "turret", icon: "⟠", name: "TURRET" },
  { key: "archer", icon: "➶", name: "ARCHER" },
  { key: "worm", icon: "🪱", name: "WORM" },
  { key: "castle", icon: "🏰", name: "CASTLE" },
];

export function createUpgradeShop({
  gRef, metaRef, setMeta, setTick, beep, ensureAudio,
}: UpgradeShopDependencies) {
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
    if (g.turrets < 4 + 2 * g.towers && g.gold >= turretCost) {
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
    if (g.archers < 4 + 2 * g.towers && g.gold >= archerCost) {
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
    if (g.worms < 2 + 2 * g.towers && g.gold >= wormCost) {
      g.gold -= wormCost;
      g.worms++;
      g.wormCds = g.wormCds.map(() => 0.3 + Math.random() * 0.5);
      beep(400, 0.09, "square", 0.05);
      setTimeout(() => beep(300, 0.12, "square", 0.05), 90);
      setTick((t) => t + 1);
    }
  };

  /* CASTLE TOWERS: every tower adds +2 turret, archer AND earthworm slots */
  const towerCost = 120 + gRef.current!.towers * 90;
  /* one-time castle-town buildings — each is a visible structure with a passive perk */
  const buyTower = () => {
    const g = gRef.current!;
    if (g.towers < 4 && g.gold >= towerCost) {
      g.gold -= towerCost;
      g.towers++;
      g.turretCds = g.turretCds.map(() => 0.3 + Math.random() * 0.5);
      g.archerCds = g.archerCds.map(() => 0.3 + Math.random() * 0.5);
      g.wormCds = g.wormCds.map(() => 0.3 + Math.random() * 0.5);
      beep(520, 0.09, "square", 0.05);
      setTimeout(() => beep(780, 0.12, "square", 0.05), 90);
      setTick((t) => t + 1);
    }
  };

  /* leveled in-run upgrades: one helper for the whole tech tree */
  const lvCost = levelUpgradeCost;
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
      | "thornLvl"
      | "repairLvl"
      | "splashLvl"
      | "volleyLvl"
      | "wormRateLvl"
      | "towerLvl"
      | "mineLvl"
      | "beaconLvl"
      | "moatLvl"
      | "cataDmgLvl"
      | "cataRateLvl"
      | "barracksLvl",
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

  /* ================= THE UPGRADE CATALOG =================
     one data list drives the whole tab-shop: the tab bar, the tile grid,
     and the info strip all read from UP_CATALOG — adding an upgrade
     means adding one entry here, nothing else. */
  type LeveledKey =
    | "turretDmgLvl"
    | "turretRateLvl"
    | "turretRangeLvl"
    | "archerDmgLvl"
    | "archerRateLvl"
    | "archerRangeLvl"
    | "rapidLvl"
    | "doubleLvl"
    | "thornLvl"
    | "repairLvl"
    | "splashLvl"
    | "volleyLvl"
    | "wormRateLvl"
    | "towerLvl"
    | "mineLvl"
    | "beaconLvl"
    | "moatLvl"
    | "cataDmgLvl"
    | "cataRateLvl"
    | "barracksLvl";
  type CatKey = UpgradeCategory;
  type UpDef = UpgradeDefinition;
  const gc = gRef.current!;
  /* leveled upgrade: everything bought through buyLeveled */
  const mk = (
    id: string,
    cat: CatKey,
    icon: string,
    short: string,
    label: string,
    desc: string,
    key: LeveledKey,
    max: number,
    base: number,
    step: number,
    lockTxt?: string,
  ): UpDef => {
    const lvl = gc[key];
    const cost = lvCost(lvl, base, step);
    const locked = lockTxt != null;
    return {
      id,
      cat,
      icon,
      short,
      name: `${label} — LV ${lvl}`,
      desc,
      cost,
      buyable: !locked && lvl < max && gc.gold >= cost,
      done: lvl >= max,
      lockTxt,
      buy: () => buyLeveled(key, max, base, step),
    };
  };
  /* one-time build: buildings and unit recruitment */
  const one = (
    id: string,
    cat: CatKey,
    icon: string,
    short: string,
    name: string,
    desc: string,
    cost: number,
    built: boolean,
    buy: () => void,
    doneTxt = "BUILT",
  ): UpDef => ({
    id,
    cat,
    icon,
    short,
    name,
    desc,
    cost,
    buyable: !built && gc.gold >= cost,
    done: built,
    doneTxt,
    buy,
  });
  const UP_CATALOG: UpDef[] = [
    /* 🏹 THE BOW — the keep's own shots */
    {
      id: "dmg",
      cat: "bow",
      icon: "⚔",
      short: "SHARPEN",
      name: `SHARPEN ARROWS — DMG ${gc.damage}`,
      desc: "Heavier heads: every arrow from your keep deals +1 damage.",
      cost: dmgCost,
      buyable: gc.gold >= dmgCost,
      done: false,
      buy: buyDamage,
    },
    {
      id: "fletch",
      cat: "bow",
      icon: "➤",
      short: "FLETCHING",
      name: `FLETCHING — LV ${gc.rangeLvl}`,
      desc: "Better feathers: +12% flight range for all your arrows.",
      cost: fletchCost,
      buyable: gc.gold >= fletchCost,
      done: false,
      buy: buyFletching,
    },
    {
      id: "eagle",
      cat: "bow",
      icon: "✦",
      short: "EAGLE EYE",
      name: `EAGLE EYE — LV ${gc.dCritLvl}/3`,
      desc: "+6% chance of a distance crit — red arrows fly twice as far and deal double damage.",
      cost: eagleCost,
      buyable: gc.gold >= eagleCost && gc.dCritLvl < 3,
      done: gc.dCritLvl >= 3,
      buy: buyEagle,
    },
    {
      id: "pierce",
      cat: "bow",
      icon: "✧",
      short: "PIERCE",
      name: `PIERCING TIPS — LV ${gc.pierceLvl}/5`,
      desc: "+10% chance arrows punch straight through the first enemy and keep flying.",
      cost: pierceCost,
      buyable: gc.gold >= pierceCost && gc.pierceLvl < 5,
      done: gc.pierceLvl >= 5,
      buy: buyPierce,
    },
    mk("rapid", "bow", "⚡", "RAPID", "RAPID HANDS", "Faster loosing: your keep fires 15% quicker per level while you hold.", "rapidLvl", 3, 50, 35),
    mk("double", "bow", "⧉", "DOUBLE", "DOUBLE-STRING", "+8% chance per level to loose a second arrow with every single shot.", "doubleLvl", 3, 60, 45),
    mk("splash", "bow", "💥", "BOOM", "EXPLOSIVE TIPS", "Oil-soaked heads: arrows burst for 30% splash damage per level to nearby enemies.", "splashLvl", 3, 90, 70),
    mk("volley", "bow", "☄", "VOLLEY", "ARROW VOLLEY", "The keep looses 2+level arrows at random enemies every 9 seconds. On its own, no aiming needed.", "volleyLvl", 3, 100, 80),
    one("turret", "turret", "⟠", "TURRET", `BUILD TURRET — ${gc.turrets}/${4 + 2 * gc.towers}`, "A wall-mounted turret fires where you aim. With AUTO SHOOT it hunts the sky.", turretCost, gc.turrets >= 4 + 2 * gc.towers, buyTurret, "ALL SLOTS FULL"),
    mk("tdmg", "turret", "⬆", "HEAVY", "HEAVY BOLTS", "Dense iron bolts: +1 damage per level on every turret and worm shot.", "turretDmgLvl", 3, 40, 25, gc.turrets < 1 ? "BUILD A TURRET FIRST" : undefined),
    mk("trate", "turret", "⚙", "BARRELS", "RAPID BARRELS", "Oiled gears: turrets reload 20% faster per level.", "turretRateLvl", 3, 45, 30, gc.turrets < 1 ? "BUILD A TURRET FIRST" : undefined),
    mk("trange", "turret", "➤", "LONG", "LONG BARRELS", "Extended barrels: +10% turret range per level.", "turretRangeLvl", 3, 40, 25, gc.turrets < 1 ? "BUILD A TURRET FIRST" : undefined),
    one("archer", "archer", "➶", "ARCHER", `RECRUIT ARCHER — ${gc.archers}/${4 + 2 * gc.towers}`, "A ground archer flanks the keep and fires where you aim. With AUTO SHOOT they hunt the grass.", archerCost, gc.archers >= 4 + 2 * gc.towers, buyArcher, "ALL SLOTS FULL"),
    mk("admg", "archer", "⬆", "BROAD", "BROADHEADS", "Wider heads: +1 damage per level on every archer arrow.", "archerDmgLvl", 3, 40, 25, gc.archers < 1 ? "RECRUIT AN ARCHER FIRST" : undefined),
    mk("arate", "archer", "⚡", "QUICK", "QUICK DRAW", "Fast hands: archers loose 20% more arrows per level.", "archerRateLvl", 3, 45, 30, gc.archers < 1 ? "RECRUIT AN ARCHER FIRST" : undefined),
    mk("arange", "archer", "➤", "EAGLE A.", "EAGLE ARCHERS", "Sharper eyes: +10% archer range per level.", "archerRangeLvl", 3, 40, 25, gc.archers < 1 ? "RECRUIT AN ARCHER FIRST" : undefined),
    one("worm", "worm", "🪱", "WORM", `BUILD EARTHWORM — ${gc.worms}/${2 + 2 * gc.towers}`, "A tunneling turret in the dirt — the ONLY unit that can shoot underground enemies. Moles arrive at wave 10!", wormCost, gc.worms >= 2 + 2 * gc.towers, buyWorm, "ALL SLOTS FULL"),
    mk("wrate", "worm", "🪱", "SEGMENTS", "THICKER SEGMENTS", "Fatter worms, faster burrow-shots: worms reload 25% quicker per level.", "wormRateLvl", 3, 45, 30, gc.worms < 1 ? "BUILD A WORM FIRST" : undefined),
    /* 🏰 YOUR TOWN */
    {
      id: "fortify",
      cat: "castle",
      icon: "▲",
      short: "FORTIFY",
      name: `FORTIFY — LV ${gc.fortLvl}`,
      desc: "Thicker walls: +20 max castle HP per level — and the keep grows a little taller.",
      cost: fortCost,
      buyable: gc.gold >= fortCost,
      done: false,
      buy: buyFortify,
    },
    {
      id: "repair",
      cat: "castle",
      icon: "✚",
      short: "REPAIR",
      name: "REPAIR",
      desc: "Masons patch the cracks: restore 35 HP right now. Cheap and always useful.",
      cost: 12,
      buyable: gc.gold >= 12 && gc.hp < gc.maxHp,
      done: gc.hp >= gc.maxHp,
      doneTxt: "FULL HP",
      buy: buyRepair,
    },
    mk("masonry", "castle", "🧱", "MASONRY", "MASONRY", "Living stone: the castle slowly repairs itself, 0.8 HP/s per level.", "repairLvl", 3, 60, 45),
    {
      id: "shield",
      cat: "castle",
      icon: "⛨",
      short: "SHIELD",
      name: `FORCE SHIELD — LV ${gc.shieldLvl}/3`,
      desc: "A bubble around the keep soaks 30 damage per level and fully regenerates between waves.",
      cost: shieldCost,
      buyable: gc.gold >= shieldCost && gc.shieldLvl < 3,
      done: gc.shieldLvl >= 3,
      buy: buyShield,
    },
    mk("thorn", "castle", "🗡", "THORNS", "THORNY WALLS", "Spiked masonry zaps every enemy that bites your gate for 2 + 2×level damage.", "thornLvl", 3, 40, 30),
    one("tower", "castle", "🏰", "TOWER", `BUILD TOWER — ${gc.towers}/4`, "A tower rises on the LEFT and RIGHT flanks of the keep: +2 turret, archer AND earthworm slots each.", towerCost, gc.towers >= 4, buyTower, "ALL TOWERS BUILT"),
    mk("lookout", "castle", "👁", "LOOKOUT", "LOOKOUT POSTS", "Watchmen in every tower: your whole garrison fires 6% faster per level.", "towerLvl", 3, 70, 50, gc.towers < 1 ? "BUILD A TOWER FIRST" : undefined),
  ];

  const TABS = UPGRADE_TABS;

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

  const buyPerk = (key: "speed" | "x3" | "autoshoot" | "autonext" | "x2gold" | "secondwind", cost: number) => {
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


  return { UP_CATALOG, TABS, buyRubyPack, buyPerk };
}
