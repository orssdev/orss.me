import { forwardRef, type ReactNode } from "react";

/** Fills the space between the menu bar and the dock. Floating windows are positioned inside it. */
export const AppScreen = forwardRef<HTMLDivElement, { children: ReactNode }>(
  function AppScreen({ children }, ref) {
    return (
      <div ref={ref} className="relative min-h-0 flex-1 overflow-hidden">
        {children}
      </div>
    );
  },
);
