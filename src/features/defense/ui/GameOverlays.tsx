import type { Meta } from "../../../game/types";
import { META_UPGRADES } from "../../../game/meta";
import { PixButton } from "../../../components/PixButton";
import { UpgradeCard } from "../../../components/UpgradeCard";

/** Paused-run overlay; presentation only, actions remain owned by the screen. */
export function PauseOverlay({ onResume, onMainMenu }: {
  onResume: () => void;
  onMainMenu: () => void;
}) {
  return (
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
              <PixButton color="#4caf50" onClick={onResume}>
                ▶ RESUME
              </PixButton>
              <PixButton color="#d9433b" small onClick={onMainMenu}>
                ⌂ MAIN MENU
              </PixButton>
            </div>
          </div>
  );
}

export function ConfirmQuitOverlay({ onKeepDefending, onQuitToMenu }: {
  onKeepDefending: () => void;
  onQuitToMenu: () => void;
}) {
  return (
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
              <PixButton color="#4caf50" small onClick={onKeepDefending}>
                KEEP DEFENDING
              </PixButton>
              <PixButton color="#d9433b" small onClick={onQuitToMenu}>
                QUIT TO MENU
              </PixButton>
            </div>
          </div>
  );
}

export function ArmoryOverlay({ meta, buyMeta, onClose }: {
  meta: Meta;
  buyMeta: (key: keyof Omit<Meta, "gold">) => void;
  onClose: () => void;
}) {
  return (
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
              <PixButton color="#d9433b" onClick={onClose}>
                CLOSE
              </PixButton>
            </div>
          </div>
  );
}
