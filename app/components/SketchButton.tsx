import { generator, SKETCH_OPTIONS, drawablesToPaths } from "./rough-utils";

const VIEWBOX = "0 0 100 40";
const PRESS_OFFSET = 5;

function Outline({ seed, filled }: { seed: number; filled?: boolean }) {
  const drawable = generator.rectangle(3, 3, 94, 34, {
    ...SKETCH_OPTIONS,
    seed,
    roughness: 1.4,
    ...(filled
      ? { fill: "currentColor", fillWeight: 0.4, fillStyle: "hachure" }
      : {}),
  });

  return (
    <svg
      viewBox={VIEWBOX}
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {drawablesToPaths([drawable])}
    </svg>
  );
}

export function SketchButton({
  children,
  seed = 5,
  filled = false,
}: {
  children: React.ReactNode;
  seed?: number;
  filled?: boolean;
}) {
  const liftClass =
    "transition-transform duration-100 ease-out group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-active:translate-x-[5px] group-active:translate-y-[5px]";

  return (
    <button
      type="button"
      className="group relative inline-flex h-14 w-44 items-center justify-center font-mono text-sm font-medium text-zinc-900 select-none dark:text-zinc-50"
    >
      {/* shadow silhouette: fixed in place, gets covered when pressed */}
      <span
        className="pointer-events-none absolute inset-0 text-zinc-300 dark:text-zinc-700"
        style={{
          transform: `translate(${PRESS_OFFSET}px, ${PRESS_OFFSET}px)`,
        }}
      >
        <Outline seed={seed + 100} />
      </span>

      {/* foreground: lifts on hover, presses down onto the shadow on click */}
      <span className={`pointer-events-none absolute inset-0 ${liftClass}`}>
        <Outline seed={seed} filled={filled} />
      </span>
      <span className={`relative ${liftClass}`}>{children}</span>
    </button>
  );
}
