import type { AppDefinition } from "../types";

function TerminalContent() {
  return (
    <div className="flex h-full items-start gap-1 px-6 py-4 font-mono text-lg">
      <span>&gt;</span>
      <span className="inline-block h-5 w-2.5 animate-pulse bg-current" />
    </div>
  );
}

export const terminalApp: AppDefinition = {
  id: "terminal",
  label: "Terminal",
  glyph: ">_",
  menu: ["Shell", "Edit", "View", "Window", "Help"],
  Content: TerminalContent,
};
