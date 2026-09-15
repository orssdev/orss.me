"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Rnd } from "react-rnd";
import type { Drawable } from "roughjs/bin/core";
import type { AppDefinition } from "../apps/types";
import type { WindowBounds, WindowSize, WindowState } from "./window-manager";
import {
  generator,
  insetRoundedRectPath,
  SKETCH_OPTIONS,
  SketchOverlay,
} from "./rough-utils";
import { CloseGlyph, MaximizeGlyph, MinimizeGlyph } from "./WindowControlGlyphs";

const TITLE_BAR_HEIGHT = 40;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;
const WINDOW_RADIUS = 16;

/** Marker classes react-rnd matches on: the title bar drags, the controls don't. */
const DRAG_HANDLE_CLASS = "window-drag-handle";
const CONTROLS_CLASS = "window-controls";

/** Border plus title-bar divider, redrawn only when the committed size changes. */
function windowChrome(width: number, height: number): Drawable[] {
  return [
    generator.path(insetRoundedRectPath(width, height, WINDOW_RADIUS, 2), {
      ...SKETCH_OPTIONS,
      seed: 100,
      roughness: 1.2,
    }),
    generator.line(2, TITLE_BAR_HEIGHT, width - 2, TITLE_BAR_HEIGHT, {
      ...SKETCH_OPTIONS,
      seed: 101,
    }),
  ];
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center text-zinc-600 transition-opacity hover:opacity-50 dark:text-zinc-300"
    >
      {children}
    </button>
  );
}

export function FloatingWindow({
  app,
  state,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onBoundsChange,
}: {
  app: AppDefinition;
  state: WindowState;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onBoundsChange: (bounds: WindowBounds) => void;
}) {
  /**
   * Live box size while a resize is in flight; null otherwise. The chrome is an
   * SVG stretched over the window (`preserveAspectRatio="none"`), so a viewBox
   * that lags the real box scales the title-bar divider away from the fixed
   * 40px title bar and skews the corner radii. Following the live size keeps
   * both pinned; committed bounds still only change on resize stop.
   */
  const [liveSize, setLiveSize] = useState<WindowSize | null>(null);
  const width = liveSize?.width ?? state.width;
  const height = liveSize?.height ?? state.height;
  const Content = app.Content;
  const chrome = useMemo(() => windowChrome(width, height), [width, height]);

  return (
    <Rnd
      size={{ width, height }}
      position={{ x: state.x, y: state.y }}
      minWidth={MIN_WIDTH}
      minHeight={MIN_HEIGHT}
      bounds="parent"
      dragHandleClassName={DRAG_HANDLE_CLASS}
      cancel={`.${CONTROLS_CLASS}`}
      disableDragging={state.isMaximized}
      enableResizing={!state.isMaximized}
      style={{ zIndex: state.zIndex }}
      onDragStop={(_e, d) => onBoundsChange({ x: d.x, y: d.y, width, height })}
      onResize={(_e, _direction, ref) =>
        setLiveSize({ width: ref.offsetWidth, height: ref.offsetHeight })
      }
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        setLiveSize(null);
        onBoundsChange({
          x: position.x,
          y: position.y,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
      }}
    >
      {/* react-rnd doesn't document forwarding onMouseDown to its root, so focus off our own wrapper. */}
      <div
        className="relative flex h-full w-full flex-col bg-white text-zinc-800 dark:bg-black dark:text-zinc-200"
        onMouseDownCapture={onFocus}
      >
        <SketchOverlay width={width} height={height} drawables={chrome} />
        <div
          className={`${DRAG_HANDLE_CLASS} relative flex shrink-0 items-center gap-2 px-3`}
          style={{ height: TITLE_BAR_HEIGHT }}
        >
          <div className={`${CONTROLS_CLASS} flex items-center gap-1`}>
            <ControlButton label="Close" onClick={onClose}>
              <CloseGlyph />
            </ControlButton>
            <ControlButton label="Minimize" onClick={onMinimize}>
              <MinimizeGlyph />
            </ControlButton>
            <ControlButton label="Maximize" onClick={onToggleMaximize}>
              <MaximizeGlyph />
            </ControlButton>
          </div>
          <span className="ml-2 truncate font-mono text-xs text-zinc-500 dark:text-white/50">
            {app.label}
          </span>
        </div>
        <div className="relative min-h-0 flex-1 overflow-auto">
          <Content />
        </div>
      </div>
    </Rnd>
  );
}
