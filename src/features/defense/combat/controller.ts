import type { Game, Meta, Enemy, Kind } from "../../../game/types";
import {
  CASTLE, TURRET_POS, TURRET_CD, ARCHER_POS, ARCHER_CD, WORM_POS, WORM_CD,
  castleScaleOf, camZoomOf, camZoomNow, scaledPos,
} from "../../../game/config";
import {
  KIND_STATS, ATK_RATE, waveScale, BOSSES, isAir, isUnder, enemyAt, pickKind, pickPath,
} from "../../../game/enemies";
import { saveMeta } from "../../../game/meta";

/**
 * Imperative simulation adapter for the current siege.
 *
 * It reads mutable runtime state and reports game events through explicit callbacks,
 * keeping the combat rules independent of the React component lifecycle.
 * This deliberately preserves the prototype's existing timing and update behavior.
 */
export interface CombatDependencies {
  gRef: { current: Game | null };
  idRef: { current: number };
  metaRef: { current: Meta };
  aspectRef: { current: number };
  fieldRef: { current: HTMLElement | null };
  tabRef: { current: "none" | "shop" | "upgrades" };
  pausedRef: { current: boolean };
  setMeta: (meta: Meta) => void;
  setTab: (tab: "none" | "shop" | "upgrades") => void;
  setPhase: (phase: "menu" | "playing" | "intermission" | "gameover") => void;
  setDice: (dice: { wave: number; value: number; display: number; settled: boolean }) => void;
  beep: (freq: number, dur?: number, type?: OscillatorType, vol?: number) => void;
}

export function createCombatController({
  gRef, idRef, metaRef, aspectRef, fieldRef, tabRef, pausedRef,
  setMeta, setTab, setPhase, setDice, beep,
}: CombatDependencies) {
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
      g.score += st.score + (e.elite ? st.score : 0);
      /* kill COMBO: chain kills within 2.5s for up to +60% gold */
      g.combo = now - g.comboAt < 2.5 ? g.combo + 1 : 1;
      g.comboAt = now;
      const comboMult = 1 + Math.min(0.6, g.combo * 0.04);
      const townsMult = 1 + Math.min(0.5, 0.02 * metaRef.current.towns);
      const goldGain = Math.round(
        e.gold * g.goldMult * comboMult * townsMult * (metaRef.current.x2gold > 0 ? 2 : 1),
      );
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
        e.kind === "muffincolossus" ||
        e.kind === "baguettebaron" ||
        e.kind === "ratking" ||
        e.kind === "golemlord" ||
        e.kind === "caketitan";
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
    /* the level multiplier: every stat scales with the current wave */
    const sc = waveScale(g.wave);
    /* ELITE roll: from wave 3, 8% of regular foes spawn golden —
       2.2× HP but 2× bounty & score. Never on bosses. */
    const mod = g.mod;
    const elite =
      g.wave >= 3 &&
      !BOSSES.some((b) => b.kind === kind) &&
      Math.random() < (mod === "elites" ? 0.25 : 0.08);
    const hp = Math.round(
      st.hp * sc.hp * (elite ? 2.2 : 1) * (mod === "fatties" ? 1.6 : 1),
    );
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
      speed: st.speed * (0.9 + Math.random() * 0.2) * sc.speed * (mod === "swift" ? 1.25 : 1),
      dmg: Math.max(1, Math.round(st.dmg * sc.dmg)),
      gold: Math.max(
        1,
        Math.round(st.gold * sc.gold * (elite ? 2 : 1) * (mod === "bounty" ? 1.5 : 1)),
      ),
      elite,
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
    g.crateAt = t + 10 + Math.random() * 8;
    /* wave MODIFIERS: from wave 3, every regular wave rolls a twist —
       the siege is never the same twice in a row of worlds */
    g.mod = "none";
    if (w >= 3 && w % 5 !== 0) {
      const mods = ["siege", "swift", "fatties", "bounty", "rush", "elites"];
      g.mod = mods[Math.floor(Math.random() * mods.length)];
    }
    if (g.mod === "siege") g.remaining = Math.ceil(g.remaining * 1.4);
    if (g.mod === "fatties") g.remaining = Math.ceil(g.remaining * 0.7);
    if (g.mod === "rush") g.spawnGap = g.spawnGap * 0.55;
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
    /* MASONRY: the keep knits its own stone back together, slowly */
    if (g.repairLvl > 0 && g.hp > 0 && g.hp < g.maxHp) {
      g.hp = Math.min(g.maxHp, g.hp + (0.4 + 0.4 * g.repairLvl) * dt);

    /* ARROW VOLLEY: the keep looses a volley on its own */
    if (g.volleyLvl > 0 && now >= g.volleyAt) {
      g.volleyAt = now + 9;
      const alive = g.enemies.filter(
        (e) => e.dying == null && !isUnder(e.kind),
      );
      const shots = 2 + g.volleyLvl;
      for (let k = 0; k < shots; k++) {
        const tgt = alive.length
          ? alive[Math.floor(Math.random() * alive.length)]
          : null;
        fireShot(
          CASTLE.x,
          CASTLE.y - 4,
          tgt ? tgt.x : 15 + Math.random() * 70,
          tgt ? tgt.y : 10 + Math.random() * 45,
          "castle",
        );
      }
      beep(700, 0.08, "square", 0.04);
    }

    /* GOLD MINE: steady trickle while the wave rages */
    if (g.mine) {
      g.mineTick -= dt;
      if (g.mineTick <= 0) {
        g.mineTick = 1;
        g.gold += 2 + g.mineLvl;
      }
    }

    /* CATAPULT: lobs a boulder at the toughest foe on its timer, with splash */
    if (g.cata && now >= g.cataAt) {
      g.cataAt = now + 7 - g.cataRateLvl;
      const alive = g.enemies.filter((e) => e.dying == null);
      if (alive.length) {
        const tgt = alive.reduce((a, b) => (b.hp > a.hp ? b : a));
        damageEnemy(tgt, 14 + 4 * g.cataDmgLvl, false, now);
        for (const e2 of alive) {
          if (e2.id !== tgt.id && dist2d(tgt.x, tgt.y, e2.x, e2.y) < 9) {
            damageEnemy(e2, 7 + 2 * g.cataDmgLvl, false, now);
          }
        }
        for (let k = 0; k < 8; k++) {
          const ang = Math.random() * Math.PI * 2;
          g.parts.push({
            id: idRef.current++,
            x: tgt.x,
            y: tgt.y,
            vx: Math.cos(ang) * 22,
            vy: Math.sin(ang) * 22 - 20,
            born: now,
            size: 4,
            color: "#8d99ae",
          });
        }
        beep(180, 0.15, "square", 0.06);
        g.shakeUntil = now + 0.15;
      }
    }

    /* BARRACKS: a foot soldier sallies out and cuts the nearest raider */
    if (g.barracks && now >= g.sortieAt) {
      g.sortieAt = now + 8;
      let tgt: Enemy | null = null;
      let bd = 26;
      for (const e of g.enemies) {
        if (e.dying != null || isUnder(e.kind)) continue;
        const d = dist2d(e.x, e.y, CASTLE.x, CASTLE.y);
        if (d < bd) {
          bd = d;
          tgt = e;
        }
      }
      if (tgt) {
        g.sortieFxAt = now;
        damageEnemy(tgt, 8 + 3 * g.barracksLvl, false, now);
        g.pops.push({
          id: idRef.current++,
          x: tgt.x,
          y: tgt.y - 12,
          text: "⚔",
          color: "#e8e8e0",
          born: now,
        });
        beep(300, 0.06, "triangle", 0.05);
      }
    }

    /* SUPPLY CRATES: drift down mid-wave — tap one out of the sky for gold */
    if (g.remaining > 0 || g.enemies.length > 0) {
      if (now >= g.crateAt) {
        g.crateAt = now + 22 + Math.random() * 14;
        g.crates.push({
          id: idRef.current++,
          x: 12 + Math.random() * 76,
          y: -6,
          rest: 30 + Math.random() * 30,
          born: now,
        });
      }
      for (const c of g.crates) if (c.y < c.rest) c.y += 3.2 * dt;
    }
    g.crates = g.crates.filter((c) => now - c.born < 10);
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
        const tgt = auto ? autoTarget("air") : null;
        const aimX = tgt ? tgt.x : !auto && g.hold ? g.hold.x : tp.x;
        const aimY = tgt ? tgt.y : !auto && g.hold ? g.hold.y : tp.y - 10;
        const desired = (Math.atan2(aimX - tp.x, -(aimY - tp.y)) * 180) / Math.PI;
        g.turretAngles[i] += (desired - g.turretAngles[i]) * Math.min(1, dt * 12);
        g.turretCds[i] -= dt;
        if (((!auto && g.hold) || tgt) && g.turretCds[i] <= 0) {
          fireShot(tp.x, tp.y - 2, aimX, aimY, "turret");
          g.turretCds[i] =
            (TURRET_CD * (0.8 + Math.random() * 0.4)) /
            ((1 + 0.2 * g.turretRateLvl) *
              (g.beacon ? 1.15 + 0.05 * g.beaconLvl : 1) *
              (1 + 0.06 * g.towerLvl));
        }
        if (g.turretCds[i] < 0) g.turretCds[i] = 0;
      }
    }

    /* ground archers flanking the castle — also fire where you aim.
       AUTO SHOOT (IAP): archers pick their own targets and focus LAND enemies */
    if (g.archers > 0) {
      for (let i = 0; i < g.archers; i++) {
        const ap = scaledPos(ARCHER_POS[i], cScale);
        const tgt = auto ? autoTarget("ground") : null;
        const aimX = tgt ? tgt.x : !auto && g.hold ? g.hold.x : ap.x;
        const aimY = tgt ? tgt.y : !auto && g.hold ? g.hold.y : ap.y - 10;
        const desired = (Math.atan2(aimX - ap.x, -(aimY - ap.y)) * 180) / Math.PI;
        g.archerAngles[i] += (desired - g.archerAngles[i]) * Math.min(1, dt * 12);
        g.archerCds[i] -= dt;
        if (((!auto && g.hold) || tgt) && g.archerCds[i] <= 0) {
          fireShot(ap.x, ap.y - 2, aimX, aimY, "archer");
          g.archerCds[i] =
            (ARCHER_CD * (0.8 + Math.random() * 0.4)) /
            ((1 + 0.2 * g.archerRateLvl) *
              (g.beacon ? 1.15 + 0.05 * g.beaconLvl : 1) *
              (1 + 0.06 * g.towerLvl));
        }
        if (g.archerCds[i] < 0) g.archerCds[i] = 0;
      }
    }

    /* earthworm turrets: the ONLY unit that can shoot underground enemies */
    if (g.worms > 0) {
      for (let i = 0; i < g.worms; i++) {
        const wp = scaledPos(WORM_POS[i], cScale);
        const tgt = auto ? autoTarget("under") : null;
        g.wormCds[i] -= dt;
        if (((!auto && g.hold) || tgt) && g.wormCds[i] <= 0) {
          fireShot(
            wp.x,
            wp.y - 2,
            tgt ? tgt.x : g.hold!.x,
            tgt ? tgt.y : g.hold!.y,
            "worm"
          );
          g.wormCds[i] = (WORM_CD * (0.8 + Math.random() * 0.4)) / (1 + 0.25 * g.wormRateLvl);
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
          const dmg = e.dmg;
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
          /* SECOND WIND perk: once per run, survive a fatal blow at 1 HP */
          if (metaRef.current.secondwind > 0 && !g.windUsed) {
            g.hp = 1;
            g.windUsed = true;
            g.castleHitAt = now;
            g.pops.push({
              id: idRef.current++,
              x: CASTLE.x,
              y: CASTLE.y - 30,
              text: "SECOND WIND!",
              color: "#ffd24a",
              born: now,
            });
            beep(880, 0.18, "square", 0.06);
            setTimeout(() => beep(1175, 0.22, "square", 0.06), 120);
          } else {
            g.hp = 0;
            setPhase("gameover");
            return;
          }
        }
        continue;
      }
      if (Math.abs(dx) > 0.8) e.face = dx > 0 ? 1 : -1;
      const st = KIND_STATS[e.kind];
      /* MOAT: the water ring slows attackers near the keep (tunnelers dig under it) */
      const moatSlow =
        g.moat && !isUnder(e.kind) && dist2d(e.x, e.y, CASTLE.x, CASTLE.y) < 15 + 2 * g.moatLvl
          ? Math.max(0.45, 0.65 - 0.05 * g.moatLvl)
          : 1;
      let mvx = (dx / dist) * e.speed * moatSlow * dt;
      let mvy = (dy / dist) * e.speed * moatSlow * dt;
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
        /* EXPLOSIVE TIPS: splash damage around the arrow's victim */
        if (g.splashLvl > 0) {
          for (const e2 of g.enemies) {
            if (e2.dying != null || e2.id === hit.id) continue;
            if (a.under ? !isUnder(e2.kind) : isUnder(e2.kind)) continue;
            if (dist2d(hit.x, hit.y, e2.x, e2.y) < 7) {
              damageEnemy(
                e2,
                Math.max(1, Math.round(a.dmg * 0.3 * g.splashLvl)),
                false,
                now,
              );
            }
          }
          g.parts.push({
            id: idRef.current++,
            x: hit.x,
            y: hit.y,
            vx: 0,
            vy: 0,
            born: now,
            size: 5,
            color: "#ff9a3d",
          });
        }
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
      g.lastBonus = Math.round((8 + g.wave * 4) * (metaRef.current.x2gold > 0 ? 2 : 1));
      g.gold += g.lastBonus;
      /* every 10th wave: a guaranteed bonus ruby, dice or no dice */
      if (g.wave % 10 === 0) {
        const m = { ...metaRef.current, rubies: metaRef.current.rubies + 1 };
        setMeta(m);
        metaRef.current = m;
        saveMeta(m);
      }
      /* every boss felled = a TOWN CONQUERED: a permanent trophy and a
         permanent +2% kill-income bonus per town (caps at +50%) */
      if (g.wave % 5 === 0) {
        const m = { ...metaRef.current, towns: metaRef.current.towns + 1 };
        setMeta(m);
        metaRef.current = m;
        saveMeta(m);
      }
      /* the ruby dice: every cleared wave rolls for a bonus ruby — a 6 wins it */
      setDice({ wave: g.wave, value: 1 + Math.floor(Math.random() * 6), display: 1, settled: false });
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

  return { startWave, update, dist2d };
}
