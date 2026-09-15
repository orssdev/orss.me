import rough from "roughjs";
import type { Drawable, Options } from "roughjs/bin/core";

export const generator = rough.generator();

export const SKETCH_OPTIONS: Options = {
  stroke: "currentColor",
  strokeWidth: 2,
  roughness: 1.6,
  fillStyle: "hachure",
  seed: 1,
};

function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): string {
  const r = Math.min(radius, width / 2, height / 2);
  return `
    M ${x + r},${y}
    L ${x + width - r},${y}
    Q ${x + width},${y} ${x + width},${y + r}
    L ${x + width},${y + height - r}
    Q ${x + width},${y + height} ${x + width - r},${y + height}
    L ${x + r},${y + height}
    Q ${x},${y + height} ${x},${y + height - r}
    L ${x},${y + r}
    Q ${x},${y} ${x + r},${y}
    Z
  `;
}

/**
 * A rounded rect pulled `inset` units in from every edge of a `width` x `height`
 * viewBox, so the rough stroke's wobble isn't clipped by the viewBox edge.
 */
export function insetRoundedRectPath(
  width: number,
  height: number,
  radius: number,
  inset: number,
): string {
  return roundedRectPath(
    inset,
    inset,
    width - inset * 2,
    height - inset * 2,
    radius,
  );
}

export function drawablesToPaths(drawables: Drawable[]) {
  return drawables
    .flatMap((drawable) => generator.toPaths(drawable))
    .map((p) => (
      <path
        key={p.d}
        d={p.d}
        fill={p.fill ?? "none"}
        stroke={p.stroke}
        strokeWidth={p.strokeWidth}
      />
    ));
}

/** Sketch layer stretched over its positioned parent; colour comes from `currentColor`. */
export function SketchOverlay({
  width,
  height,
  drawables,
  className = "",
}: {
  width: number;
  height: number;
  drawables: Drawable[];
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      {drawablesToPaths(drawables)}
    </svg>
  );
}
