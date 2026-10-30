import React, { useEffect, useRef, useState } from "react";
import type { Game, Meta } from "../../game/types";
import { SPRITES } from "../../game/sprites";
import {
  CASTLE, TURRET_POS, TOWER_SPOTS, MAX_TURRETS,
  ARCHER_POS, WORM_POS, castleScaleOf, camZoomNow,
  ROCKS, TUNNELS, PINES, scaledPos, waveLabel,
} from "../../game/config";
import { KIND_STATS, waveScale, DICE_PIPS, MOD_LABELS, BOSSES } from "../../game/enemies";
import { makeGame } from "../../game/state";
import type { TownKey } from "../../game/meta";
import { RUBY_PACKS, PERKS, TOWN_BLDGS, loadMeta, saveMeta } from "../../game/meta";
import { PixelSprite } from "../../components/PixelSprite";
import { PixButton } from "../../components/PixButton";
import { UpgradeCard } from "../../components/UpgradeCard";
import { createCombatController } from "./combat/controller";
import { createDefenseInputHandlers } from "./input/defenseInput";
import { useGameAudio } from "./audio/useGameAudio";
import { useGameLoop } from "./useGameLoop";

import { createUpgradeShop } from "./upgrades/upgradeShop";
import { createPermanentPurchases } from "./upgrades/permanentPurchases";
import { PauseOverlay, ConfirmQuitOverlay, ArmoryOverlay } from "./ui/GameOverlays";

export default function PixelKeep() {
  const [phase, setPhase] = useState<"menu" | "playing" | "intermission" | "gameover">("menu");
  const [, setTick] = useState(0);
  const idRef = useRef(1);
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
  const [dice, setDice] = useState<{ wave: number; value: number; display: number; settled: boolean } | null>(null);
  /* score already converted to meta gold this run — stops die/respawn/die farming */
  const scoredRef = useRef(0);
  const [tab, setTab] = useState<"none" | "shop" | "upgrades">("none");
  const tabRef = useRef(tab);
  tabRef.current = tab;
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;
  const [quitWarn, setQuitWarn] = useState(false);
  const [shopTab, setShopTab] = useState<"rubies" | "perks">("rubies");
  const [selUp, setSelUp] = useState<string | null>(null);
  /* active shop tab — one tab per unit family */
  const [upTab, setUpTab] = useState<"bow" | "turret" | "archer" | "worm" | "castle">("bow");
  const [showHowTo, setShowHowTo] = useState(false);
  const [menuShop, setMenuShop] = useState(false);
  const [splash, setSplash] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTown, setShowTown] = useState(false);
  const [selTown, setSelTown] = useState<TownKey | null>(null);
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

  const { ensureAudio, beep } = useGameAudio(soundOnRef);
  const { startWave, update, dist2d } = createCombatController({
    gRef, idRef, metaRef, aspectRef, fieldRef, tabRef, pausedRef,
    setMeta, setTab, setPhase, setDice, beep,
  });

  useGameLoop(phase, update, () => setTick((n) => n + 1));

  /* ruby dice roll: tumbles random faces for ~0.9s, then settles —
     a 6 is LUCKY and awards +1 ruby */
  useEffect(() => {
    if (!dice || dice.settled) return;
    const iv = setInterval(() => {
      setDice((d) => (d && !d.settled ? { ...d, display: 1 + Math.floor(Math.random() * 6) } : d));
    }, 90);
    const to = setTimeout(() => {
      clearInterval(iv);
      setDice((d) => (d ? { ...d, display: d.value, settled: true } : d));
      if (dice.value === 6) {
        const m = { ...metaRef.current, rubies: metaRef.current.rubies + 1 };
        setMeta(m);
        metaRef.current = m;
        saveMeta(m);
        ensureAudio();
        beep(988, 0.09, "square", 0.06);
        setTimeout(() => beep(1319, 0.14, "square", 0.06), 110);
      }
    }, 900);
    return () => {
      clearInterval(iv);
      clearTimeout(to);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dice && !dice.settled ? dice.wave : null]);

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
      /* convert score into permanent meta gold — only newly earned score
         counts, so respawning and dying again never double-dips */
      const earned = Math.max(0, Math.floor((g.score - scoredRef.current) / 10));
      scoredRef.current = g.score;
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

  const { onFieldDown, onFieldMove, endHold } = createDefenseInputHandlers({
    phase, gRef, fieldRef, setTick,
  });

  const { UP_CATALOG, TABS, buyRubyPack, buyPerk } = createUpgradeShop({
    gRef, metaRef, setMeta, setTick, beep, ensureAudio,
  });

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

  /* ruby respawn: cheat death — full HP, shield refilled, and the
     besiegers at your gate are driven back */
  const respawn = () => {
    const g = gRef.current!;
    const m = metaRef.current;
    if (m.rubies < 50) return;
    const nm = { ...m, rubies: m.rubies - 50 };
    setMeta(nm);
    metaRef.current = nm;
    saveMeta(nm);
    g.hp = g.maxHp;
    g.shield = 30 * g.shieldLvl;
    const cs = castleScaleOf(g.fortLvl);
    g.enemies = g.enemies.filter(
      (e) => Math.hypot(CASTLE.x - e.x, CASTLE.y - e.y) > KIND_STATS[e.kind].reach * cs * 2.2
    );
    ensureAudio();
    beep(660, 0.1, "square", 0.06);
    setTimeout(() => beep(990, 0.16, "square", 0.06), 120);
    setPhase("playing");
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
    /* the courtyard town: buildings are persistent meta structures */
    ng.mine = m.townMine > 0;
    ng.mineLvl = Math.max(0, m.townMine - 1);
    if (ng.mine) ng.mineTick = 1;
    ng.beacon = m.townBeacon > 0;
    ng.beaconLvl = Math.max(0, m.townBeacon - 1);
    ng.moat = m.townMoat > 0;
    ng.moatLvl = Math.max(0, m.townMoat - 1);
    ng.cata = m.townCata > 0;
    ng.cataDmgLvl = Math.max(0, m.townCata - 1);
    ng.cataRateLvl = Math.max(0, m.townCata - 1);
    ng.barracks = m.townBarracks > 0;
    ng.barracksLvl = Math.max(0, m.townBarracks - 1);
    gRef.current = ng;
    scoredRef.current = 0;
    setShowArmory(false);
    setShowTown(false);
    setSelTown(null);
    ensureAudio();
    startWave(1);
  };

  /* back to the main menu from intermission or the game-over screen */
  const goMenu = () => {
    setTab("none");
    setMenuShop(false);
    setShowArmory(false);
    setShowSettings(false);
    setShowTown(false);
    setSelTown(null);
    setShowPrivacy(false);
    setPaused(false);
    setQuitWarn(false);
    setPhase("menu");
    beep(392, 0.09);
  };

  const { buyMeta, buyTown } = createPermanentPurchases({
    metaRef, setMeta, setTick, ensureAudio, beep,
  });

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
          0% { transform: translateX(-14vw); opacity: 0 }
          3% { opacity: 1 }
          10% { transform: translateX(34vw); opacity: 0 }
          100% { transform: translateX(34vw); opacity: 0 }
        }
        @keyframes skysway {
          0%, 100% { transform: translateX(-1.4%) }
          50% { transform: translateX(1.4%) }
        }
        @keyframes moondrift {
          0%, 100% { transform: translate(0, 0) }
          50% { transform: translate(-2.4vw, 1.4vh) }
        }
        @keyframes diceroll {
          0% { transform: rotate(0deg) }
          25% { transform: rotate(16deg) translateY(-2px) }
          50% { transform: rotate(-12deg) }
          75% { transform: rotate(8deg) translateY(-1px) }
          100% { transform: rotate(0deg) }
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

          {/* towers flank the keep on the left and right — each adds unit slots */}
          {TOWER_SPOTS.slice(0, g.towers).map((p, i) => {
            const pos = scaledPos(p, castleScale);
            return (
              <div
                key={`tower-${i}`}
                className="absolute pointer-events-none"
                style={{
                  left: `${S(pos.x)}%`,
                  top: `${S(pos.y)}%`,
                  transform: "translate(-50%,-100%)",
                }}
              >
                <PixelSprite sprite={SPRITES.tower} px={4 * castleScale * z} />
              </div>
            );
          })}

          {/* castle-town buildings rise around the keep as you build them */}
          {(
            [
              { k: "mine", s: { x: 12, y: 95 } },
              { k: "beacon", s: { x: 88, y: 95 } },
              { k: "cata", s: { x: 50, y: 97 } },
              { k: "barracks", s: { x: 30, y: 96 } },
            ] as const
          )
            .filter((b) => g[b.k])
            .map((b) => {
              const pos = scaledPos(b.s, castleScale);
              return (
                <div
                  key={b.k}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${S(pos.x)}%`,
                    top: `${S(pos.y)}%`,
                    transform: "translate(-50%,-100%)",
                  }}
                >
                  <PixelSprite sprite={SPRITES[b.k]} px={3.5 * castleScale * z} />
                </div>
              );
            })}
          {/* the barracks guard stands watch by the gate — hops when he sorties */}
          {g.barracks && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${S(scaledPos({ x: 63, y: 95 }, castleScale).x)}%`,
                top: `${S(scaledPos({ x: 63, y: 95 }, castleScale).y)}%`,
                transform: `translate(-50%,-100%) translateY(${
                  now - g.sortieFxAt >= 0 && now - g.sortieFxAt < 0.3
                    ? -5 * Math.sin(((now - g.sortieFxAt) / 0.3) * Math.PI)
                    : 0
                }px)`,
              }}
            >
              <PixelSprite sprite={SPRITES.guard} px={4 * castleScale * z} />
            </div>
          )}
          {g.moat && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${S(CASTLE.x)}%`,
                top: `${S(CASTLE.y)}%`,
                transform: "translate(-50%,-50%)",
                width: 200 * castleScale * z,
                height: 90 * castleScale * z,
                borderRadius: "50%",
                border: `${Math.max(1.5, 2.5 * z)}px solid #3d7ebf`,
                background: "rgba(64,148,255,0.18)",
                boxShadow: `0 0 ${8 * z}px rgba(64,148,255,0.35)`,
              }}
            />
          )}

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
                    transform: `scaleX(${g.archerAngles[i] < 0 ? -1 : 1})`,
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
              e.kind === "bat" ||
              e.kind === "ghost" ||
              e.kind === "imp" ||
              e.kind === "harpy" ||
              e.kind === "willowisp" ||
              e.kind === "eclair";
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
                {!dead && e.elite && (
                  <div
                    style={{
                      position: "absolute",
                      top: -14 * z,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: Math.max(8, 9 * z),
                      color: "#ffd24a",
                      textShadow: "0 1px 0 #000, 0 0 4px #ffd24a",
                    }}
                  >
                    ★
                  </div>
                )}
                <div
                  style={{
                    transform: `translateY(${-bob}px) rotate(${rot}deg) scaleX(${e.face}) scale(${
                      1 - dprog * 0.4
                    })`,
                    opacity: 1 - dprog,
                    filter: flash
                      ? "brightness(3) saturate(0)"
                      : e.elite
                      ? `drop-shadow(0 0 ${3 * z}px #ffd24a)`
                      : undefined,
                  }}
                >
                  <PixelSprite sprite={SPRITES[e.kind]} px={st.px * z} />
                </div>
              </div>
            );
          })}

          {/* supply crates — tap one out of the sky for bonus gold */}
          {g.crates.map((c) => (
            <div
              key={c.id}
              onPointerDown={(ev) => {
                ev.stopPropagation();
                const gg = gRef.current!;
                const bonus = 4 + gg.wave * 2;
                gg.gold += bonus;
                gg.goldPulseUntil = now + 0.5;
                gg.pops.push({
                  id: idRef.current++,
                  x: c.x,
                  y: c.y - 8,
                  text: "+" + bonus,
                  color: "#ffd24a",
                  born: now,
                });
                gg.crates = gg.crates.filter((o) => o.id !== c.id);
                beep(660, 0.1, "square", 0.05);
                setTimeout(() => beep(990, 0.12, "square", 0.05), 90);
              }}
              style={{
                position: "absolute",
                left: `${S(c.x)}%`,
                top: `${S(c.y)}%`,
                transform: `translate(-50%,-50%) translateY(${Math.sin(now * 3 + c.id) * 3}px)`,
                pointerEvents: "auto",
                cursor: "pointer",
              }}
            >
              <PixelSprite sprite={SPRITES.crate} px={4 * z} />
            </div>
          ))}

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
              {g.combo >= 3 && now - g.comboAt < 2.5 && (
                <div
                  className="border-2 border-black px-2 py-1"
                  style={{ background: "#3a2408" }}
                >
                  <span
                    className="text-[8px] text-[#ffd24a]"
                    style={{ animation: "blink 1s infinite" }}
                  >
                    COMBO ×{g.combo} +{Math.round(Math.min(0.6, g.combo * 0.04) * 100)}% GOLD
                  </span>
                </div>
              )}
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
              {Math.round(g.hp)}/{g.maxHp}
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
              <div className="text-[9px] text-white/85" style={{ textShadow: "0 2px 0 #000" }}>
                ENEMY POWER ×{waveScale(g.wave).hp.toFixed(2)}
              </div>
              {g.mod !== "none" && (
                <div className="text-[9px] text-[#ff9a3d]" style={{ textShadow: "0 2px 0 #000" }}>
                  {MOD_LABELS[g.mod]}
                </div>
              )}
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
            {/* living night scene: stars (slow sway), shooting stars, drifting moon, clouds, the keep, pines */}
            <div
              className="absolute inset-0"
              style={{ animation: "skysway 46s ease-in-out infinite" }}
            >
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
            </div>
            {[
              { left: "6%", top: "5%", dur: 9, delay: 0 },
              { left: "44%", top: "3%", dur: 13, delay: 5 },
              { left: "22%", top: "11%", dur: 10, delay: 8 },
              { left: "70%", top: "7%", dur: 15, delay: 11 },
            ].map((s, i) => (
              <div
                key={"mshoot" + i}
                className="absolute"
                style={{ left: s.left, top: s.top, transform: "rotate(22deg)" }}
              >
                <div
                  style={{
                    width: 64,
                    height: 3,
                    borderRadius: 2,
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.95))",
                    boxShadow: "0 0 6px rgba(255,255,255,0.8)",
                    opacity: 0,
                    animation: `shoot ${s.dur}s linear ${s.delay}s infinite`,
                  }}
                />
              </div>
            ))}
            <div
              className="absolute"
              style={{
                left: "70%",
                top: "4%",
                filter: "drop-shadow(0 0 22px rgba(247,164,29,0.45))",
                animation: "moondrift 70s ease-in-out infinite",
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
                  ★ BEST: {best} • 🏳 TOWNS: {meta.towns}
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
                      setSelTown(null);
                      setShowTown(true);
                    }}
                  >
                    🏚 TOWN
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
              className="flex flex-col items-center border-4 px-12 py-9"
              style={{
                borderColor: "#ff4500",
                background: "#000",
                animation: "logoin 0.9s ease-out both",
              }}
            >
              <div
                className="text-white"
                style={{
                  fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
                  fontWeight: 900,
                  fontSize: 40,
                  lineHeight: 1,
                  letterSpacing: "0.02em",
                }}
              >
                SekaFaji.
              </div>
              <div
                className="text-[#ff4500] mt-3"
                style={{
                  fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
                  fontWeight: 900,
                  fontSize: 19,
                  lineHeight: 1,
                  letterSpacing: "0.35em",
                  marginRight: "-0.35em",
                }}
              >
                GAMES
              </div>
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
                ["✨", "ELITE foes glow gold: 2.2× HP but double bounty. Chain kills within 2.5s for COMBO gold!"],
                ["📦", "SUPPLY CRATES drift down mid-wave — tap one out of the sky for bonus gold!"],
                ["⚔", "From wave 3, every wave rolls a MODIFIER (SIEGE, SWIFT, BOUNTY…) — read the banner and adapt!"],
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
                <PixButton
                  small
                  color="#8d6742"
                  onClick={() => {
                    ensureAudio();
                    setSelTown(null);
                    setShowTown(true);
                  }}
                >
                  🏚 TOWN
                </PixButton>
              </div>

              <div className="text-[#4caf50] text-sm" style={{ textShadow: "0 2px 0 #000" }}>
                {waveLabel(g.wave)} CLEARED!
              </div>
              {g.wave % 5 === 0 && (
                <div className="text-[9px] text-[#ff8fa3]" style={{ textShadow: "0 2px 0 #000" }}>
                  🏳 TOWN CONQUERED — permanent +2% kill gold!
                </div>
              )}
              <div className="text-[10px] text-[#ffd24a]">+{g.lastBonus} gold bonus</div>
              {/* ruby dice — every cleared wave rolls for a ruby (6 = LUCKY) */}
              {dice && dice.wave === g.wave && (
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="grid grid-cols-3 gap-[2px] border-4 border-black bg-[#f5f0e0] p-[3px]"
                    style={{
                      width: 48,
                      height: 48,
                      animation: dice.settled ? "none" : "diceroll 0.14s infinite",
                    }}
                  >
                    {Array.from({ length: 9 }, (_, i) => (
                      <div
                        key={i}
                        style={{ background: DICE_PIPS[dice.display].includes(i) ? "#111" : "transparent" }}
                      />
                    ))}
                  </div>
                  {dice.settled ? (
                    dice.value === 6 ? (
                      <div className="text-[9px] text-[#e05fd0]" style={{ textShadow: "0 2px 0 #000" }}>
                        LUCKY! +1 RUBY ♦
                      </div>
                    ) : (
                      <div className="text-[9px] text-white/50">UNLUCKY…</div>
                    )
                  ) : (
                    <div className="text-[9px] text-white/50" style={{ animation: "blink 0.5s infinite" }}>
                      ROLLING…
                    </div>
                  )}
                </div>
              )}
              <div className="text-[9px] text-white/70 text-center leading-4">
                Arrows: {g.damage} dmg • Pierce: {Math.round(g.pierce * 100)}% • Castle: {Math.round(g.hp)}/
                {g.maxHp} HP
                <br />
                Range: {Math.round(g.range)} • Dist-crit: {Math.round(g.dCritChance * 100)}% •
                Turrets: {g.turrets}/{4 + 2 * g.towers} • Archers: {g.archers}/{4 + 2 * g.towers} •
                Worms: {g.worms}/{2 + 2 * g.towers} • Towers: {g.towers}/4
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

        {paused && (
          <PauseOverlay
            onResume={() => setPaused(false)}
            onMainMenu={() => setQuitWarn(true)}
          />
        )}
        {quitWarn && (
          <ConfirmQuitOverlay
            onKeepDefending={() => setQuitWarn(false)}
            onQuitToMenu={goMenu}
          />
        )}

        {/* ----- shop: ruby packs + premium perks, in scrollable tabs ----- */}
        {/* ----- the courtyard: your persistent town inside the castle walls ----- */}
        {showTown && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/90 p-4"
            style={{ zIndex: 47 }}
          >
            <div
              className="flex flex-col items-center gap-2 border-4 border-black p-3 max-w-[320px] w-full max-h-[94%] overflow-y-auto"
              style={{ background: "#1c2138" }}
            >
              <div className="text-[#ffd24a] text-sm" style={{ textShadow: "0 2px 0 #000" }}>
                🏚 THE COURTYARD
              </div>
              <div className="text-[8px] text-white/50 text-center leading-3">
                Your town lives inside the castle walls — buildings survive every defeat.
              </div>
              <div className="text-[10px] text-[#ffd24a]">⛁ {meta.gold} META GOLD</div>

              {/* the courtyard scene: walled yard, keep at the top, building plots */}
              <div
                className="relative w-full border-4 border-black overflow-hidden"
                style={{ height: 150, background: "#2c4a26" }}
              >
                <div
                  className="absolute inset-1 border-4"
                  style={{ borderColor: "#565d63", boxShadow: "inset 0 0 0 2px #000" }}
                />
                {/* corner watchtowers */}
                {[
                  { left: 2, top: 2 },
                  { right: 2, top: 2 },
                  { left: 2, bottom: 2 },
                  { right: 2, bottom: 2 },
                ].map((c, i) => (
                  <div key={"ctow" + i} className="absolute" style={c}>
                    <PixelSprite sprite={SPRITES.tower} px={2} />
                  </div>
                ))}
                {/* the keep */}
                <div
                  className="absolute"
                  style={{ left: "50%", top: 6, transform: "translateX(-50%)" }}
                >
                  <PixelSprite sprite={SPRITES.castle} px={4} />
                </div>
                {/* building plots */}
                {TOWN_BLDGS.map((b) => {
                  const lvl = meta[b.key];
                  const cost = b.base * Math.pow(2, lvl);
                  const maxed = lvl >= 4;
                  return (
                    <button
                      key={b.key}
                      onClick={() => {
                        ensureAudio();
                        beep(660, 0.05);
                        setSelTown(b.key);
                      }}
                      className="absolute flex flex-col items-center justify-center gap-0.5"
                      style={{
                        left: `${b.plot.x}%`,
                        top: `${b.plot.y}%`,
                        width: 52,
                        height: 44,
                        border:
                          selTown === b.key
                            ? "2px solid #ffd24a"
                            : lvl > 0
                            ? "2px solid transparent"
                            : "2px dashed rgba(255,255,255,0.4)",
                        background: lvl > 0 ? "transparent" : "rgba(0,0,0,0.25)",
                      }}
                    >
                      {lvl > 0 ? (
                        <>
                          {b.key === "townMoat" ? (
                            <div
                              style={{
                                width: 40,
                                height: 12,
                                borderRadius: "50%",
                                background: "#3b5bdc",
                                border: "2px solid #14171c",
                                boxShadow: "0 0 3px #1c2f8a",
                              }}
                            />
                          ) : (
                            <PixelSprite sprite={SPRITES[b.sprite!]} px={3} />
                          )}
                          <span className="text-[5px] leading-[6px]">
                            <span className="text-[#ffd24a]">{"●".repeat(lvl)}</span>
                            <span className="text-white/30">{"●".repeat(4 - lvl)}</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[12px] leading-[14px] opacity-70">
                            {b.icon}
                          </span>
                          <span className="text-[5px] text-white/60 leading-[7px] text-center">
                            {b.name}
                          </span>
                          <span
                            className="text-[5px] leading-[7px]"
                            style={{
                              color: meta.gold >= cost ? "#ffd24a" : "#8d99ae",
                            }}
                          >
                            {maxed ? "MAX" : `${cost}◆`}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* selected building card */}
              {selTown ? (
                (() => {
                  const def = TOWN_BLDGS.find((b) => b.key === selTown)!;
                  const lvl = meta[def.key];
                  const maxed = lvl >= 4;
                  const cost = def.base * Math.pow(2, lvl);
                  return (
                    <UpgradeCard
                      icon={def.icon}
                      name={`${def.name} — ${"●".repeat(lvl)}${"○".repeat(4 - lvl)}`}
                      desc={
                        lvl > 0
                          ? `Now: ${def.fx(lvl)}${maxed ? "." : `. Next: ${def.fx(lvl + 1)}.`} ${def.desc}`
                          : `${def.desc} ${def.fx(1)}.`
                      }
                      cost={maxed ? "" : `${cost}◆`}
                      disabled={maxed || meta.gold < cost}
                      done={maxed ? "MAXED" : undefined}
                      action={lvl > 0 ? "UPGRADE" : "BUILD"}
                      onClick={() => buyTown(def.key)}
                    />
                  );
                })()
              ) : (
                <div className="text-[8px] text-white/40">tap a plot to build or upgrade</div>
              )}

              <PixButton
                color="#d9433b"
                onClick={() => {
                  setShowTown(false);
                  setSelTown(null);
                }}
              >
                CLOSE
              </PixButton>
            </div>
          </div>
        )}

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
              {/* tab bar — one tab per unit family, green dot = something affordable */}
              <div className="grid grid-cols-5 gap-1 pb-1">
                {TABS.map((t) => {
                  const anyBuy = UP_CATALOG.some((u) => u.cat === t.key && u.buyable);
                  const active = upTab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => {
                        ensureAudio();
                        beep(660, 0.04);
                        setUpTab(t.key);
                        setSelUp(null);
                      }}
                      className="relative flex flex-col items-center justify-center border-2 border-black py-1"
                      style={{
                        background: active ? "#ffd24a" : "#1a1f33",
                        color: active ? "#000" : "#8d99ae",
                      }}
                    >
                      <span className="text-[10px] leading-3">{t.icon}</span>
                      <span className="text-[5px] leading-[7px]">{t.name}</span>
                      {anyBuy && (
                        <span
                          className="absolute rounded-full"
                          style={{
                            top: 1,
                            right: 1,
                            width: 4,
                            height: 4,
                            background: "#4caf50",
                            boxShadow: "0 0 3px #4caf50",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <div
                className="scrollbox overflow-y-auto flex flex-col items-center gap-2 py-2 px-1 border-4 border-black"
                style={{ height: 240, background: "#262b44" }}
              >
                {/* one small tile grid for the active tab — tap = buy, and the
                     description appears in the strip below: no second menu */}
                <div className="grid grid-cols-4 gap-1 w-full">
                  {UP_CATALOG.filter((u) => u.cat === upTab).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelUp(u.id);
                        if (u.buyable) u.buy();
                      }}
                      className="relative border-2 border-black flex flex-col items-center justify-center gap-0.5 py-1"
                      style={{
                        background: selUp === u.id ? "#2a3154" : u.done ? "#181d2f" : "#202642",
                        borderColor: u.buyable ? "#4caf50" : "black",
                        opacity: u.lockTxt ? 0.55 : 1,
                      }}
                    >
                      {u.buyable && (
                        <span
                          className="absolute rounded-full"
                          style={{
                            top: 2,
                            right: 2,
                            width: 5,
                            height: 5,
                            background: "#4caf50",
                            boxShadow: "0 0 3px #4caf50",
                          }}
                        />
                      )}
                      <span className="text-[12px] leading-[14px]">
                        {u.lockTxt ? "🔒" : u.icon}
                      </span>
                      <span className="text-[5px] text-white/85 leading-[7px] text-center">
                        {u.short}
                      </span>
                      <span
                        className="text-[5px] leading-[7px]"
                        style={{
                          color: u.done
                            ? "#4caf50"
                            : u.lockTxt
                            ? "#8d99ae"
                            : gc.gold >= u.cost
                            ? "#ffd24a"
                            : "#8d99ae",
                        }}
                      >
                        {u.done ? "MAX" : u.lockTxt ? "LOCKED" : `${u.cost}g`}
                      </span>
                    </button>
                  ))}
                </div>
                {/* info strip — the last-tapped upgrade, always in view */}
                {selUp ? (
                  (() => {
                    const u = UP_CATALOG.find((d) => d.id === selUp);
                    if (!u) return null;
                    return (
                      <div
                        className="w-full border-2 border-black px-1.5 py-1 mt-1"
                        style={{ background: "#181d2f" }}
                      >
                        <div className="text-[7px] text-white/90 leading-3">
                          {u.icon} {u.name}
                        </div>
                        <div className="text-[6px] text-white/55 leading-[8px] pt-0.5">
                          {u.desc}
                        </div>
                        <div
                          className="text-[6px] leading-[8px] pt-0.5"
                          style={{
                            color: u.done
                              ? "#4caf50"
                              : u.lockTxt
                              ? "#ffd76e"
                              : u.buyable
                              ? "#ffd24a"
                              : "#8d99ae",
                          }}
                        >
                          {u.done
                            ? `✓ ${u.doneTxt || "MAXED"}`
                            : u.lockTxt
                            ? `🔒 ${u.lockTxt}`
                            : `${u.cost}g`}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-[6px] text-white/35 text-center leading-3 pt-1">
                    tap a tile to buy — its details appear here
                  </div>
                )}
              </div>
              <PixButton
                color="#d9433b"
                onClick={() => {
                  setTab("none");
                  setSelUp(null);
                }}
              >
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
              <PixButton color="#e05fd0" disabled={meta.rubies < 50} onClick={respawn}>
                ♥ RESPAWN — 50 ♦
              </PixButton>
              <div className="flex items-center justify-center gap-2">
                <PixButton color="#8d6742" small onClick={() => setShowArmory(true)}>
                  ◆ ARMORY
                </PixButton>
                <PixButton
                  color="#8d6742"
                  small
                  onClick={() => {
                    setSelTown(null);
                    setShowTown(true);
                  }}
                >
                  🏚 TOWN
                </PixButton>
                <PixButton color="#d9433b" small onClick={goMenu}>
                  ⌂ MAIN MENU
                </PixButton>
              </div>
            </div>
          </div>
        )}

        {showArmory && (
          <ArmoryOverlay
            meta={meta}
            buyMeta={buyMeta}
            onClose={() => setShowArmory(false)}
          />
        )}
      </div>

      <p className="hidden sm:block text-[8px] text-white/40 text-center max-w-[380px] leading-4">
        arrows carry on past your aim • red arrows = distance crits (2× range) • crits deal ×2 •
        boss every 5th wave • the map widens every level — FORTIFY grows your keep
      </p>
    </div>
  );

}
