import React from "react";
import type { Sprite } from "../game/sprites";

export function PixelSprite({
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
