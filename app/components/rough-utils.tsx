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
