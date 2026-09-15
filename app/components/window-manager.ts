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

/** A freshly opened window at the default size, centred in an `area`-sized region. */
export function centeredWindow(area: WindowSize, zIndex: number): WindowState {
  const { width, height } = DEFAULT_WINDOW_SIZE;
  return {
    x: Math.max((area.width - width) / 2, 0),
    y: Math.max((area.height - height) / 2, 0),
    width,
    height,
    zIndex,
    isMaximized: false,
    isMinimized: false,
    restoreBounds: null,
  };
}

/** Puts a window at the top of the stack, un-minimizing it on the way. */
export function raised(win: WindowState, zIndex: number): WindowState {
  return { ...win, zIndex, isMinimized: false };
}
