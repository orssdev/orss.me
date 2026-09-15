import type { ReactNode } from "react";
import { PressableSketch } from "./PressableSketch";

export function SketchButton({
  children,
  seed = 5,
  filled = false,
}: {
  children: ReactNode;
  seed?: number;
  filled?: boolean;
}) {
  return (
    <PressableSketch
      seed={seed}
      width={176}
      height={56}
      radius={8}
      filled={filled}
      className="font-mono text-sm font-medium text-zinc-900 select-none dark:text-zinc-50"
    >
      {children}
    </PressableSketch>
  );
}
