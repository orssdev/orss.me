import type { ComponentPropsWithoutRef, ReactNode } from "react";
import {
  generator,
  insetRoundedRectPath,
  SKETCH_OPTIONS,
  SketchOverlay,
} from "./rough-utils";

/** How far the tile drops when pressed. Must match the `group-active:` translate in LIFT. */
const PRESS_OFFSET = 4;
/** Keeps the shadow outline from being an exact tracing of the foreground one. */
const SHADOW_SEED_OFFSET = 100;
const STROKE_INSET = 3;

const LIFT =
  "transition-transform duration-100 ease-out group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-active:translate-x-[4px] group-active:translate-y-[4px]";

function Outline({
  seed,
  width,
  height,
  radius,
  filled,
}: {
  seed: number;
  width: number;
  height: number;
  radius: number;
  filled?: boolean;
}) {
  const drawable = generator.path(
    insetRoundedRectPath(width, height, radius, STROKE_INSET),
    {
      ...SKETCH_OPTIONS,
      seed,
      roughness: 1.4,
      ...(filled ? { fill: "currentColor", fillWeight: 0.4 } : {}),
    },
  );

  return (
    <SketchOverlay width={width} height={height} drawables={[drawable]} />
  );
}

/**
 * A rough-sketched tile that lifts on hover and presses onto its own shadow on click.
 * `width` and `height` are both the rendered pixel size and the sketch viewBox.
 */
export function PressableSketch({
  seed,
  width,
  height,
  radius,
  filled = false,
  className = "",
  children,
  ...buttonProps
}: {
  seed: number;
  width: number;
  height: number;
  radius: number;
  filled?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<
  ComponentPropsWithoutRef<"button">,
  "className" | "children" | "style"
>) {
  return (
    <button
      type="button"
      className={`group relative inline-flex items-center justify-center ${className}`}
      style={{ width, height }}
      {...buttonProps}
    >
      {/* shadow silhouette: fixed in place, gets covered when the tile presses onto it */}
      <span
        className="pointer-events-none absolute inset-0 text-zinc-300 dark:text-zinc-700"
        style={{ transform: `translate(${PRESS_OFFSET}px, ${PRESS_OFFSET}px)` }}
      >
        <Outline
          seed={seed + SHADOW_SEED_OFFSET}
          width={width}
          height={height}
          radius={radius}
        />
      </span>

      {/* foreground: lifts on hover, presses down onto the shadow on click */}
      <span className={`pointer-events-none absolute inset-0 ${LIFT}`}>
        <Outline
          seed={seed}
          width={width}
          height={height}
          radius={radius}
          filled={filled}
        />
      </span>
      <span className={`relative ${LIFT}`}>{children}</span>
    </button>
  );
}
