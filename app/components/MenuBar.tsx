import type { AppDefinition } from "../apps/types";
import { ThemeToggle } from "./ThemeToggle";
import { MenuBarClock } from "./MenuBarClock";

export function MenuBar({ app }: { app: AppDefinition | null }) {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-300 px-4 font-mono text-sm dark:border-white/20">
      <div className="flex items-center gap-5">
        {app && <span className="font-semibold">{app.label}</span>}
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <MenuBarClock />
      </div>
    </div>
  );
}
