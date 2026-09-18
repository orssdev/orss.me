import type { ReactNode } from "react";
import { ScribbleDivider, ScribbleHighlight } from "./rough-utils";

/** Offsets so a row's hover fill, selected fill and divider aren't the same squiggle. */
const SELECTED_SEED_OFFSET = 50;
const DIVIDER_SEED_OFFSET = 90;
/** Gap between sibling rows' seeds, so a list isn't one squiggle repeated. */
const ROW_SEED_STEP = 11;

/** The seed for row `index` of a list started at `base`. */
export function rowSeed(base: number, index: number): number {
  return base + index * ROW_SEED_STEP;
}

/** One shaded backdrop for a row; the caller's classes decide colour and when it shows. */
function HighlightLayer({ seed, className }: { seed: number; className: string }) {
  return (
    <span className={`pointer-events-none absolute inset-0 ${className}`}>
      <ScribbleHighlight seed={seed} />
    </span>
  );
}

/**
 * A selectable list row with a hand-drawn hover/selected fill and a wobbly
 * bottom divider, standing in for a flat CSS background + border. The shared
 * building block for any row list in this sketch UI (Notes' sidebar, Files'
 * sidebar and listing) — new ones should build on this rather than
 * reimplementing hover/selected with plain Tailwind colors.
 */
export function ScribbleRow({
  seed,
  isSelected,
  onClick,
  onDoubleClick,
  className = "",
  contentClassName = "",
  children,
}: {
  seed: number;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`group relative block w-full px-4 py-2 text-left ${className}`}
    >
      {/*
        Both layers stay light and semi-transparent — this sits *behind* the
        row's text, and dense/solid hachure fought small mono text for
        legibility (a real regression once already: screenshot showed the
        secondary line under a selected row nearly unreadable).
      */}
      {/* hover: lighter, and suppressed while the row is already selected */}
      <HighlightLayer
        seed={seed}
        className={`text-zinc-300 opacity-0 transition-opacity duration-150 dark:text-zinc-600 ${
          isSelected ? "" : "group-hover:opacity-60"
        }`}
      />
      <HighlightLayer
        seed={seed + SELECTED_SEED_OFFSET}
        className={`text-zinc-400 opacity-0 dark:text-zinc-500 ${
          isSelected ? "opacity-70" : ""
        }`}
      />
      <ScribbleDivider seed={seed + DIVIDER_SEED_OFFSET} />
      <span className={`relative ${contentClassName}`}>{children}</span>
    </button>
  );
}
