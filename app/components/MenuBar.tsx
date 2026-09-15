import type { AppDefinition } from "../apps/types";
import { ThemeToggle } from "./ThemeToggle";
import { MenuBarClock } from "./MenuBarClock";
import { generator, SKETCH_OPTIONS, drawablesToPaths } from "./rough-utils";

/** Stand-in for a system/desktop icon in the menu bar's app-name slot. */
function DesktopGlyph() {
  const drawables = [generator.circle(10, 10, 14, { ...SKETCH_OPTIONS, strokeWidth: 1.5 })];

  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden="true">
      {drawablesToPaths(drawables)}
    </svg>
  );
}

export function MenuBar({ app }: { app: AppDefinition | null }) {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-300 px-4 font-mono text-sm dark:border-white/20">
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-1.5 font-semibold">
          <DesktopGlyph />
          {app ? app.label : "Desktop"}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <MenuBarClock />
      </div>
    </div>
  );
}
