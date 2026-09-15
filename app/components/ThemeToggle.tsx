"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { PressableSketch } from "./PressableSketch";

function subscribe(): () => void {
  return function unsubscribe() {};
}

function getSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

export function ThemeToggle() {
  // The server always renders "not mounted"; the resolved theme is only known client-side.
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const label = isDark ? "dark" : "light";

  return (
    <PressableSketch
      seed={17}
      width={64}
      height={28}
      radius={6}
      className="font-mono text-xs text-zinc-800 dark:text-zinc-200"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {mounted ? label : ""}
    </PressableSketch>
  );
}
