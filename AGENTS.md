<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## What this is

A hand-drawn/sketchy "desktop OS" prototype — a personal hobby site styled like a pencil sketch, with a menu bar, a dock, and apps that open as draggable/resizable floating windows. Stack: Next.js (App Router) + React + TypeScript + Tailwind v4, `roughjs` for the hand-drawn rendering, `react-rnd` for window drag/resize, `next-themes` for light/dark.

## Typography

The mono face is Monaspace Radon (Nerd Font patched) — a handwriting-styled monospace chosen deliberately for the sketch vibe, and Nerd-Font-patched so a future Terminal app can render icon glyphs. Self-hosted via `next/font/local` in `app/layout.tsx` (files under `app/fonts/`, license at `app/fonts/LICENSE.txt`), exposed as the CSS custom property `--font-radon`, which `globals.css` maps to Tailwind's `--font-mono` — so it's just `font-mono`, same as before. Don't reach for a Google Font or another local mono face here without deliberately revisiting this choice; it's load-bearing for the whole UI's identity, not an incidental pick. `Geist` (sans) is unrelated leftover boilerplate — nothing in the app opts into `font-sans`.

## Sketch rendering (`app/components/rough-utils.tsx`)

Every hand-drawn border/shape goes through this file's shared `generator` (a `rough.generator()` instance), `SKETCH_OPTIONS`, `roundedRectPath`/`insetRoundedRectPath`, and the `SketchOverlay` component (the `<svg>` wrapper around `drawablesToPaths`). Reuse these instead of calling `rough.generator()` or writing a rounded-rect path elsewhere.

`SketchOverlay` must keep `preserveAspectRatio="none"`. Its `viewBox` can briefly disagree with the rendered box (a component that recomputes its paths on an interaction *stop* rather than every frame, a CSS-driven size change), and without that attribute the SVG letterboxes instead of stretching, visually detaching the border from the box — this was a real regression once already.

The flip side: a stretched overlay is only safe for shapes whose *whole* geometry should scale with the box. Anything drawn at a fixed pixel offset — `FloatingWindow`'s title-bar divider at `y = TITLE_BAR_HEIGHT` — drifts away from the fixed-height DOM element it's supposed to sit under as soon as the viewBox is stale, so such overlays must track the live box size (see the window manager note below).

## Clickable sketch tiles (`app/components/PressableSketch.tsx`)

The shared primitive for anything clickable in this style: draws a rough outline plus an offset "shadow" copy, lifts on hover and presses onto its own shadow on click/tap — all via CSS transforms, no JS. `SketchButton`, `DockIcon`, `DesktopIcon`, and `ThemeToggle` all build on this. New clickable sketch elements should too, rather than re-implementing the hover/press effect.

## Apps as features (`app/apps/`)

Each app is a folder under `app/apps/<name>/` exporting an `AppDefinition` (`app/apps/types.ts`: `id`, `label`, `glyph`, `menu`, `Content`). `app/apps/registry.ts` is the single list every shell component reads from — `Dock`, `MenuBar`, and the window manager in `Desktop.tsx` are all generic over `AppDefinition` and never special-case an app by id. Adding an app should mean "new folder + one line in the registry," not touching shell internals.

## Desktop shell / window manager (`app/components/Desktop.tsx`, `FloatingWindow.tsx`)

`Desktop.tsx` is a client component (window state can't live in a Server Component) owning `windows: Record<appId, WindowState>` (position/size/z-index/minimized/maximized) and `focusedAppId`. Model is **singleton-per-app**: one window per app; clicking its dock icon again focuses/un-minimizes rather than opening a duplicate. `FloatingWindow.tsx` wraps `react-rnd` for the drag/resize mechanics while keeping our own rough.js chrome as the visual layer. Bounds are committed to `Desktop.tsx` on drag/resize *stop* only, but the chrome itself follows a local `liveSize` updated on every `onResize` frame, so the title-bar divider and corner radii stay pinned mid-resize; `liveSize` is cleared on stop. Feeding the live size back into `Rnd`'s `size` prop is safe — `re-resizable` renders from its own internal state while `isResizing`.

Known gaps, not yet fixed: resizing an unfocused window doesn't bring it to front (react-rnd's resize handles sit outside the div the focus-capture handler is on); shrinking the browser doesn't re-clamp windows that end up partly off-screen.

## Theme

Tailwind's `dark:` variant is class-based (`@custom-variant dark` in `globals.css`), driven by `next-themes` (`ThemeProvider` in `theme-provider.tsx`, wired into `app/layout.tsx` with `suppressHydrationWarning`). For any client-only value that must match between server and first client render (mount state, the live clock in `MenuBarClock.tsx`), use `useSyncExternalStore` rather than `useState` + `useEffect` — the latter trips the `react-hooks/set-state-in-effect` lint rule and this codebase has standardized on the former.

## Mobile

Not built yet — below the `sm` breakpoint the whole desktop/window UI is replaced with a static "Mobile — coming soon" placeholder (CSS-only `sm:hidden`/`hidden sm:flex` swap, no JS breakpoint detection).

## Workflow for new features here

Use the `feature-dev` skill for anything that's a genuinely new feature (not routine fixes/config), and run the `code-simplifier` agent on the diff after implementing, before calling the work done.
