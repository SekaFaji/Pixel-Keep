import { useEffect } from "react";

/**
 * Fixed-capped requestAnimationFrame driver. Starts/stops with the playing phase.
 * Keeps the prototype's existing 50ms delta cap and frame-driven UI refresh.
 */
export function useGameLoop(
  phase: "menu" | "playing" | "intermission" | "gameover",
  update: (now: number, dt: number) => void,
  onFrame: () => void,
) {
  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      update(t / 1000, dt);
      onFrame();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

}
