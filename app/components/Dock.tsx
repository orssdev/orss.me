import type { AppDefinition } from "../apps/types";
import { DOCK_ICON_SIZE, DockIcon } from "./DockIcon";
import {
  generator,
  insetRoundedRectPath,
  SKETCH_OPTIONS,
  SketchOverlay,
} from "./rough-utils";

const GAP = 6;
const PADDING = 10;
const HEIGHT = DOCK_ICON_SIZE + PADDING * 2;
const DOCK_RADIUS = 14;
const STROKE_INSET = 2;

function dockWidth(appCount: number): number {
  return (
    PADDING * 2 + appCount * DOCK_ICON_SIZE + Math.max(appCount - 1, 0) * GAP
  );
}

function DockOutline({ width }: { width: number }) {
  const drawable = generator.path(
    insetRoundedRectPath(width, HEIGHT, DOCK_RADIUS, STROKE_INSET),
    { ...SKETCH_OPTIONS, seed: 900, roughness: 0.6 },
  );

  return (
    <SketchOverlay
      width={width}
      height={HEIGHT}
      drawables={[drawable]}
      className="text-zinc-800 dark:text-zinc-200"
    />
  );
}

export function Dock({
  apps,
  openAppIds,
  onSelect,
}: {
  apps: AppDefinition[];
  openAppIds: Set<string>;
  onSelect: (appId: string) => void;
}) {
  const width = dockWidth(apps.length);

  return (
    <div
      className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center transition-[width] duration-200"
      style={{ width, height: HEIGHT, padding: PADDING, gap: GAP }}
    >
      <DockOutline width={width} />
      {apps.map((app, index) => (
        <DockIcon
          key={app.id}
          label={app.label}
          glyph={app.glyph}
          seed={index * 37 + 11}
          isOpen={openAppIds.has(app.id)}
          onSelect={() => onSelect(app.id)}
        />
      ))}
    </div>
  );
}
