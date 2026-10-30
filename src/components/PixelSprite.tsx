import React from "react";
import type { Sprite } from "../game/sprites";

/* sprite raster cache: every (sprite, px) pair is drawn ONCE to an offscreen
   canvas and reused as an <img>. A hundred DOM rects per enemy per frame
   becomes one GPU-composited image — this is the late-game lag fix. */
const spriteImgCache = new WeakMap<Sprite, Map<number, string>>();
const spriteURL = (sprite: Sprite, px: number) => {
  let m = spriteImgCache.get(sprite);
  if (!m) {
    m = new Map();
    spriteImgCache.set(sprite, m);
  }
  const hit = m.get(px);
  if (hit) return hit;
  const w = sprite.rows[0].length;
  const h = sprite.rows.length;
  const cv = document.createElement("canvas");
  cv.width = Math.max(1, Math.round(w * px));
  cv.height = Math.max(1, Math.round(h * px));
  const ctx = cv.getContext("2d")!;
  sprite.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === ".") continue;
      ctx.fillStyle = sprite.colors[c];
      ctx.fillRect(x * px, y * px, px + 0.02, px + 0.02);
    }
  });
  const url = cv.toDataURL();
  m.set(px, url);
  return url;
};

export function PixelSprite({
  sprite,
  px,
  style,
}: {
  sprite: Sprite;
  px: number;
  style?: React.CSSProperties;
}) {
  /* round the raster scale so zoom transitions can't flood the cache */
  const kpx = Math.max(1, Math.round(px));
  return (
    <img
      src={spriteURL(sprite, kpx)}
      width={sprite.rows[0].length * px}
      height={sprite.rows.length * px}
      alt=""
      draggable={false}
      style={{ imageRendering: "pixelated", display: "block", ...style }}
    />
  );
}

