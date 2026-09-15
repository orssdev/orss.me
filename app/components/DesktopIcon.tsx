import { PressableSketch } from "./PressableSketch";

export function DesktopIcon({
  label,
  seed = 301,
}: {
  label: string;
  seed?: number;
}) {
  return (
    <PressableSketch
      seed={seed}
      width={96}
      height={80}
      radius={6}
      className="flex-col gap-1 font-mono text-xs text-zinc-800 dark:text-zinc-200"
    >
      {label}
    </PressableSketch>
  );
}
