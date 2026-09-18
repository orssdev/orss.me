"use client";

import { useCallback, useRef, useState } from "react";
import type { AppDefinition } from "@/kernel/app-definition";
import { useInstalledApps } from "@/kernel/installed-apps";
import { MenuBar } from "./MenuBar";
import { AppScreen } from "./AppScreen";
import { Dock } from "./Dock";
import { FloatingWindow } from "./FloatingWindow";
import {
  centeredWindow,
  DEFAULT_WINDOW_SIZE,
  raised,
  type WindowBounds,
  type WindowSize,
  type WindowState,
} from "./window-manager";

const SCREEN =
  "h-screen w-full bg-white text-zinc-900 dark:bg-black dark:text-white";

/** Centred "coming soon" notice, for the tiers the desktop UI isn't built for yet. */
const PLACEHOLDER_SCREEN =
  `${SCREEN} items-center justify-center px-8 text-center font-mono text-lg`;

export function Desktop() {
  const apps = useInstalledApps();
  const [windows, setWindows] = useState<Record<string, WindowState>>({});
  const [focusedAppId, setFocusedAppId] = useState<string | null>(null);
  const topZIndex = useRef(1);
  const screenRef = useRef<HTMLDivElement>(null);

  const nextZIndex = useCallback((): number => {
    topZIndex.current += 1;
    return topZIndex.current;
  }, []);

  /** Size of the region windows live in, measured on demand; null before first paint. */
  const measureScreen = useCallback((): WindowSize | null => {
    const rect = screenRef.current?.getBoundingClientRect();
    return rect ? { width: rect.width, height: rect.height } : null;
  }, []);

  /** Applies `update` to one window, leaving the map alone if that window is gone. */
  const updateWindow = useCallback(
    (appId: string, update: (win: WindowState) => WindowState) => {
      setWindows((prev) => {
        const win = prev[appId];
        if (!win) return prev;
        return { ...prev, [appId]: update(win) };
      });
    },
    [],
  );

  const focus = useCallback(
    (appId: string) => {
      const zIndex = nextZIndex();
      setFocusedAppId(appId);
      updateWindow(appId, (win) => raised(win, zIndex));
    },
    [nextZIndex, updateWindow],
  );

  /** One window per app: open it centred on the screen, or raise the one already there. */
  const openOrFocus = useCallback(
    (appId: string) => {
      const zIndex = nextZIndex();
      const area = measureScreen() ?? DEFAULT_WINDOW_SIZE;
      const defaultSize = apps.find((app) => app.id === appId)?.defaultSize;
      setFocusedAppId(appId);
      setWindows((prev) => {
        const win = prev[appId];
        return {
          ...prev,
          [appId]: win
            ? raised(win, zIndex)
            : centeredWindow(area, zIndex, defaultSize),
        };
      });
    },
    [apps, measureScreen, nextZIndex],
  );

  const blurIfFocused = useCallback((appId: string) => {
    setFocusedAppId((current) => (current === appId ? null : current));
  }, []);

  const closeWindow = useCallback(
    (appId: string) => {
      setWindows((prev) => {
        const rest = { ...prev };
        delete rest[appId];
        return rest;
      });
      blurIfFocused(appId);
    },
    [blurIfFocused],
  );

  const minimizeWindow = useCallback(
    (appId: string) => {
      updateWindow(appId, (win) => ({ ...win, isMinimized: true }));
      blurIfFocused(appId);
    },
    [blurIfFocused, updateWindow],
  );

  const toggleMaximize = useCallback(
    (appId: string) => {
      const area = measureScreen();
      updateWindow(appId, (win) => {
        if (win.isMaximized && win.restoreBounds) {
          return {
            ...win,
            ...win.restoreBounds,
            isMaximized: false,
            restoreBounds: null,
          };
        }
        if (!area) return win;
        const restoreBounds: WindowBounds = {
          x: win.x,
          y: win.y,
          width: win.width,
          height: win.height,
        };
        return {
          ...win,
          x: 0,
          y: 0,
          width: area.width,
          height: area.height,
          isMaximized: true,
          restoreBounds,
        };
      });
    },
    [measureScreen, updateWindow],
  );

  const updateBounds = useCallback(
    (appId: string, bounds: WindowBounds) => {
      updateWindow(appId, (win) => ({ ...win, ...bounds }));
    },
    [updateWindow],
  );

  const openAppIds = new Set(Object.keys(windows));
  const focusedApp: AppDefinition | null =
    apps.find((app) => app.id === focusedAppId) ?? null;

  return (
    <>
      <div className={`${SCREEN} hidden flex-col overflow-hidden lg:flex`}>
        <MenuBar app={focusedApp} />
        <AppScreen ref={screenRef}>
          {apps.map((app) => {
            const state = windows[app.id];
            if (!state || state.isMinimized) return null;
            return (
              <FloatingWindow
                key={app.id}
                app={app}
                state={state}
                onFocus={() => focus(app.id)}
                onClose={() => closeWindow(app.id)}
                onMinimize={() => minimizeWindow(app.id)}
                onToggleMaximize={() => toggleMaximize(app.id)}
                onBoundsChange={(bounds) => updateBounds(app.id, bounds)}
              />
            );
          })}
        </AppScreen>
        <Dock apps={apps} openAppIds={openAppIds} onSelect={openOrFocus} />
      </div>

      <div className={`${PLACEHOLDER_SCREEN} hidden sm:flex lg:hidden`}>
        Tablet — coming soon
      </div>

      <div className={`${PLACEHOLDER_SCREEN} flex sm:hidden`}>
        Mobile — coming soon
      </div>
    </>
  );
}
