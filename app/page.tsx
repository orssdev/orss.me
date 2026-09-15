import { SketchBot } from "./components/SketchBot";
import { SketchButton } from "./components/SketchButton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-10 bg-zinc-50 dark:bg-black">
      <SketchBot />
      <div className="flex flex-wrap items-center justify-center gap-8">
        <SketchButton seed={5}>Primary</SketchButton>
        <SketchButton seed={42} filled>
          Filled
        </SketchButton>
      </div>
    </div>
  );
}
