import type React from "react";
import type { Game } from "../../../game/types";
import { camZoomNow } from "../../../game/config";

/** Convert browser pointer coordinates to field-relative percentages. */
export function pointerToFieldPercent(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
) {
  return {
    x: ((clientX - rect.left) / rect.width) * 100,
    y: ((clientY - rect.top) / rect.height) * 100,
  };
}

/** Convert field percentages back into world coordinates through camera zoom. */
export function fieldPointToWorld(sx: number, sy: number, zoom: number) {
  return {
    x: (sx - 50 * (1 - zoom)) / zoom,
    y: (sy - 50 * (1 - zoom)) / zoom,
  };
}

interface InputDependencies {
  phase: "menu" | "playing" | "intermission" | "gameover";
  gRef: { current: Game | null };
  fieldRef: { current: HTMLDivElement | null };
  setTick: (updater: (tick: number) => number) => void;
}

/**
 * Pointer event adapter for the live game field. Arrow and unit cooldowns
 * intentionally retain their original tap/drag semantics.
 */
export function createDefenseInputHandlers({ phase, gRef, fieldRef, setTick }: InputDependencies) {
  /* ----- pointer input (hold & drag to fire) ----- */
  /* screen % → world coords through the camera */
  const screenToWorld = (sx: number, sy: number) => {
    const zz = camZoomNow(gRef.current!);
    return fieldPointToWorld(sx, sy, zz);
  };
  const pointerPos = (ev: React.PointerEvent) => {
    const rect = fieldRef.current!.getBoundingClientRect();
    return pointerToFieldPercent(ev.clientX, ev.clientY, rect);
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

  return { onFieldDown, onFieldMove, endHold };
}
