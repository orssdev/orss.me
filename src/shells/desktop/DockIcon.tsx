import { PressableSketch } from "@/components/sketch/PressableSketch";

export const DOCK_ICON_SIZE = 44;

export function DockIcon({
  label,
  glyph,
  seed,
  isOpen,
  onSelect,
}: {
  label: string;
  glyph: string;
  seed: number;
  isOpen: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="relative">
      <PressableSketch
        seed={seed}
        width={DOCK_ICON_SIZE}
        height={DOCK_ICON_SIZE}
        radius={8}
        roughness={0.6}
        className="shrink-0 font-mono text-base text-zinc-900 dark:text-zinc-50"
        aria-label={label}
        title={label}
        onClick={onSelect}
      >
        {glyph}
      </PressableSketch>
      {isOpen && (
        <span className="pointer-events-none absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-zinc-800 dark:bg-zinc-200" />
      )}
    </div>
  );
}
