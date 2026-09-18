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

export type ScribbleOrientation = "horizontal" | "vertical";

/**
 * Nominal box the highlight's hachure is drawn into. The overlay stretches to
 * the real row, so these only set how dense and slanted the shading looks.
 */
const HIGHLIGHT_WIDTH = 240;
const HIGHLIGHT_HEIGHT = 36;
/** Keeps the fill's wobble from being clipped at the viewBox edge. */
const HIGHLIGHT_INSET = 2;

/**
 * A hachure-filled rough rectangle, stretched over its positioned parent — the
 * sketched stand-in for a flat CSS background color on a hover/selected row.
 * Caller controls color and opacity via `className` (both use `currentColor`).
 */
export function ScribbleHighlight({
  seed,
  className = "",
}: {
  seed: number;
  className?: string;
}) {
  const drawable = generator.rectangle(
    HIGHLIGHT_INSET,
    HIGHLIGHT_INSET,
    HIGHLIGHT_WIDTH - HIGHLIGHT_INSET * 2,
    HIGHLIGHT_HEIGHT - HIGHLIGHT_INSET * 2,
    {
      ...SKETCH_OPTIONS,
      seed,
      roughness: 2.4,
      fill: "currentColor",
      fillWeight: 1,
      // Wide gap so this reads as a light wash behind text, not hatching drawn over it.
      hachureGap: 7,
      stroke: "none",
    },
  );
  return (
    <SketchOverlay
      width={HIGHLIGHT_WIDTH}
      height={HIGHLIGHT_HEIGHT}
      drawables={[drawable]}
      className={className}
    />
  );
}

/** Nominal length of a scribbled line; the overlay stretches it to the real edge. */
const LINE_LENGTH = 240;
/** Thickness of the viewBox the line is centred in, so its wobble isn't clipped. */
const LINE_BOX = 4;
const LINE_CENTER = LINE_BOX / 2;

/** A hand-drawn stand-in for a straight CSS border — a single wobbly rough line. */
export function ScribbleLine({
  seed,
  orientation = "horizontal",
  className = "",
}: {
  seed: number;
  orientation?: ScribbleOrientation;
  className?: string;
}) {
  const isHorizontal = orientation === "horizontal";
  const [width, height] = isHorizontal
    ? [LINE_LENGTH, LINE_BOX]
    : [LINE_BOX, LINE_LENGTH];
  const [x1, y1, x2, y2] = isHorizontal
    ? [0, LINE_CENTER, LINE_LENGTH, LINE_CENTER]
    : [LINE_CENTER, 0, LINE_CENTER, LINE_LENGTH];
  const drawable = generator.line(x1, y1, x2, y2, {
    ...SKETCH_OPTIONS,
    seed,
    roughness: 1.8,
    strokeWidth: 1.25,
  });

  return (
    <SketchOverlay
      width={width}
      height={height}
      drawables={[drawable]}
      className={className}
    />
  );
}

/**
 * A `ScribbleLine` pinned to one edge of its positioned parent — the drop-in
 * replacement for a structural `border-b`/`border-r` divider (a panel split,
 * a toolbar's bottom edge) elsewhere in this sketch UI.
 *
 * The parent must not scroll, or the divider scrolls away with its content —
 * wrap a scrolling panel in a non-scrolling `relative` element and pin the
 * divider to that instead.
 */
export function ScribbleDivider({
  seed,
  orientation = "horizontal",
  className = "",
}: {
  seed: number;
  orientation?: ScribbleOrientation;
  className?: string;
}) {
  const edge =
    orientation === "horizontal"
      ? "inset-x-0 bottom-0 h-1.5"
      : "inset-y-0 right-0 w-1.5";

  return (
    <span
      className={`pointer-events-none absolute ${edge} text-zinc-300 dark:text-zinc-700 ${className}`}
    >
      <ScribbleLine seed={seed} orientation={orientation} />
    </span>
  );
}
