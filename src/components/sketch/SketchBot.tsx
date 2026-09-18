import { generator, SKETCH_OPTIONS, drawablesToPaths } from "./rough-utils";

// Boxy desktop bot: antenna, screen-like head, rectangular body on two legs.
function DesktopBot() {
  const drawables = [
    generator.line(90, 40, 90, 20, SKETCH_OPTIONS),
    generator.circle(90, 14, 12, { ...SKETCH_OPTIONS, fill: "currentColor" }),
    generator.rectangle(40, 40, 100, 80, { ...SKETCH_OPTIONS, fill: "currentColor", fillWeight: 0.5 }),
    generator.circle(65, 75, 14, { ...SKETCH_OPTIONS, fill: "currentColor" }),
    generator.circle(115, 75, 14, { ...SKETCH_OPTIONS, fill: "currentColor" }),
    generator.rectangle(30, 130, 120, 90, SKETCH_OPTIONS),
    generator.line(30, 150, 4, 190, SKETCH_OPTIONS),
    generator.line(150, 150, 176, 190, SKETCH_OPTIONS),
    generator.line(60, 220, 60, 260, SKETCH_OPTIONS),
    generator.line(120, 220, 120, 260, SKETCH_OPTIONS),
    generator.rectangle(40, 260, 30, 16, SKETCH_OPTIONS),
    generator.rectangle(110, 260, 30, 16, SKETCH_OPTIONS),
  ];

  return (
    <svg
      viewBox="0 0 180 290"
      className="h-64 w-auto text-zinc-800 dark:text-zinc-200 sm:h-80"
      aria-hidden="true"
    >
      {drawablesToPaths(drawables)}
    </svg>
  );
}

// Round, friendly mobile bot: single blob body, stubby arms, no legs.
function MobileBot() {
  const drawables = [
    generator.line(70, 40, 70, 16, SKETCH_OPTIONS),
    generator.circle(70, 10, 8, { ...SKETCH_OPTIONS, fill: "currentColor" }),
    generator.circle(70, 90, 100, { ...SKETCH_OPTIONS, fillWeight: 0.5 }),
    generator.circle(50, 80, 10, { ...SKETCH_OPTIONS, fill: "currentColor" }),
    generator.circle(90, 80, 10, { ...SKETCH_OPTIONS, fill: "currentColor" }),
    generator.arc(70, 100, 40, 30, 0.3, Math.PI - 0.3, false, SKETCH_OPTIONS),
    generator.line(24, 92, -8, 72, SKETCH_OPTIONS),
    generator.line(116, 92, 148, 72, SKETCH_OPTIONS),
  ];

  return (
    <svg
      viewBox="-16 0 172 160"
      className="h-48 w-auto text-zinc-800 dark:text-zinc-200"
      aria-hidden="true"
    >
      {drawablesToPaths(drawables)}
    </svg>
  );
}

export function SketchBot() {
  return (
    <>
      <div className="hidden sm:block">
        <DesktopBot />
      </div>
      <div className="sm:hidden">
        <MobileBot />
      </div>
    </>
  );
}
