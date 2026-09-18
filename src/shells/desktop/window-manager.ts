import type { WindowSizePreset } from "@/kernel/window";

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowBounds extends WindowSize {
  x: number;
  y: number;
}

export interface WindowState extends WindowBounds {
  zIndex: number;
  isMaximized: boolean;
  isMinimized: boolean;
  restoreBounds: WindowBounds | null;
}

export const DEFAULT_WINDOW_SIZE: WindowSize = { width: 640, height: 420 };

/** Every preset but `"fullscreen"` — that one is the live screen, not fixed pixels. */
export type FixedSizePreset = Exclude<WindowSizePreset, "fullscreen">;

const SIZE_PRESETS: Record<FixedSizePreset, WindowSize> = {
  small: DEFAULT_WINDOW_SIZE,
  medium: { width: 900, height: 600 },
};

export function presetSize(preset: FixedSizePreset): WindowSize {
  return SIZE_PRESETS[preset];
}

function centeredBounds(size: WindowSize, area: WindowSize): WindowBounds {
  return {
    x: Math.max((area.width - size.width) / 2, 0),
    y: Math.max((area.height - size.height) / 2, 0),
    ...size,
  };
}

/**
 * A freshly opened window sized per `defaultSize`, centred in an `area`-sized
 * region. Opening at `"fullscreen"` starts maximized, and gets `restoreBounds`
 * up front so un-maximizing has somewhere to land.
 */
export function centeredWindow(
  area: WindowSize,
  zIndex: number,
  defaultSize: WindowSizePreset = "small",
): WindowState {
  const isMaximized = defaultSize === "fullscreen";
  return {
    ...centeredBounds(isMaximized ? area : presetSize(defaultSize), area),
    zIndex,
    isMaximized,
    isMinimized: false,
    restoreBounds: isMaximized
      ? centeredBounds(presetSize("small"), area)
      : null,
  };
}

/** Puts a window at the top of the stack, un-minimizing it on the way. */
export function raised(win: WindowState, zIndex: number): WindowState {
  return { ...win, zIndex, isMinimized: false };
}
