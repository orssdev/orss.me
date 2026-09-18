import type { ComponentPropsWithoutRef, ReactNode } from "react";
import {
  generator,
  insetRoundedRectPath,
  SKETCH_OPTIONS,
  SketchOverlay,
} from "./rough-utils";

/** Fixed offset of the shadow silhouette behind the tile. */
const PRESS_OFFSET = 4;
/** Keeps the shadow outline from being an exact tracing of the foreground one. */
const SHADOW_SEED_OFFSET = 100;
const STROKE_INSET = 3;

function Outline({
  seed,
  width,
  height,
  radius,
  roughness,
  filled,
}: {
  seed: number;
  width: number;
  height: number;
  radius: number;
  roughness: number;
  filled?: boolean;
}) {
  const drawable = generator.path(
    insetRoundedRectPath(width, height, radius, STROKE_INSET),
    {
      ...SKETCH_OPTIONS,
      seed,
      roughness,
      ...(filled ? { fill: "currentColor", fillWeight: 0.4 } : {}),
    },
  );

  return (
    <SketchOverlay width={width} height={height} drawables={[drawable]} />
  );
}

/**
 * A rough-sketched, static tile — no hover/press animation. Pass `shadow` for
 * a fixed offset shadow silhouette behind it. `width` and `height` are both
 * the rendered pixel size and the sketch viewBox.
 */
export function PressableSketch({
  seed,
  width,
  height,
  radius,
  roughness = 1.4,
  filled = false,
  shadow = false,
  className = "",
  children,
  ...buttonProps
}: {
  seed: number;
  width: number;
  height: number;
  radius: number;
  roughness?: number;
  filled?: boolean;
  shadow?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<
  ComponentPropsWithoutRef<"button">,
  "className" | "children" | "style"
>) {
  return (
    <button
      type="button"
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width, height }}
      {...buttonProps}
    >
      {shadow && (
        <span
          className="pointer-events-none absolute inset-0 text-zinc-300 dark:text-zinc-700"
          style={{
            transform: `translate(${PRESS_OFFSET}px, ${PRESS_OFFSET}px)`,
          }}
        >
          <Outline
            seed={seed + SHADOW_SEED_OFFSET}
            width={width}
            height={height}
            radius={radius}
            roughness={roughness}
          />
        </span>
      )}

      <span className="pointer-events-none absolute inset-0">
        <Outline
          seed={seed}
          width={width}
          height={height}
          radius={radius}
          roughness={roughness}
          filled={filled}
        />
      </span>
      <span className="relative">{children}</span>
    </button>
  );
}
