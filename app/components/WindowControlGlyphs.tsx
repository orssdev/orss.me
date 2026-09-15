import type { ReactNode } from "react";

/** Plain (non-sketch) glyphs for window controls — at 10px, rough.js wobble reads as noise, not charm. */
function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 10 10"
      className="h-2.5 w-2.5"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      {children}
    </svg>
  );
}

export function CloseGlyph() {
  return (
    <Glyph>
      <path d="M1 1 L9 9 M9 1 L1 9" />
    </Glyph>
  );
}

export function MaximizeGlyph() {
  return (
    <Glyph>
      <rect x="1.5" y="1.5" width="7" height="7" />
    </Glyph>
  );
}

export function MinimizeGlyph() {
  return (
    <Glyph>
      <path d="M1 5 L9 5" />
    </Glyph>
  );
}
