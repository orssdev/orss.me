<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## What this is

A hand-drawn/sketchy "desktop OS" prototype — a personal hobby site styled like a pencil sketch, with a menu bar, a dock, and apps that open as draggable/resizable floating windows. Stack: Next.js (App Router) + React + TypeScript + Tailwind v4, `roughjs` for the hand-drawn rendering, `react-rnd` for window drag/resize, `next-themes` for light/dark.

## Sketch rendering (`app/components/rough-utils.tsx`)

Every hand-drawn border/shape goes through this file's shared `generator` (a `rough.generator()` instance), `SKETCH_OPTIONS`, `roundedRectPath`/`insetRoundedRectPath`, and the `SketchOverlay` component (the `<svg>` wrapper around `drawablesToPaths`). Reuse these instead of calling `rough.generator()` or writing a rounded-rect path elsewhere.

`SketchOverlay` must keep `preserveAspectRatio="none"`. Several components (e.g. `FloatingWindow`) only recompute their rough paths when a drag/resize *stops*, not on every frame, so mid-interaction the rendered box briefly has a different aspect ratio than the last-committed `viewBox`. Without that attribute the SVG letterboxes instead of stretching, visually detaching the border from the box — this was a real regression once already.

## Clickable sketch tiles (`app/components/PressableSketch.tsx`)

The shared primitive for anything clickable in this style: draws a rough outline plus an offset "shadow" copy, lifts on hover and presses onto its own shadow on click/tap — all via CSS transforms, no JS. `SketchButton`, `DockIcon`, `DesktopIcon`, and `ThemeToggle` all build on this. New clickable sketch elements should too, rather than re-implementing the hover/press effect.

## Apps as features (`app/apps/`)

Each app is a folder under `app/apps/<name>/` exporting an `AppDefinition` (`app/apps/types.ts`: `id`, `label`, `glyph`, `menu`, `Content`). `app/apps/registry.ts` is the single list every shell component reads from — `Dock`, `MenuBar`, and the window manager in `Desktop.tsx` are all generic over `AppDefinition` and never special-case an app by id. Adding an app should mean "new folder + one line in the registry," not touching shell internals.

## Desktop shell / window manager (`app/components/Desktop.tsx`, `FloatingWindow.tsx`)

`Desktop.tsx` is a client component (window state can't live in a Server Component) owning `windows: Record<appId, WindowState>` (position/size/z-index/minimized/maximized) and `focusedAppId`. Model is **singleton-per-app**: one window per app; clicking its dock icon again focuses/un-minimizes rather than opening a duplicate. `FloatingWindow.tsx` wraps `react-rnd` for the drag/resize mechanics while keeping our own rough.js chrome as the visual layer; bounds are committed on drag/resize *stop* only (see the `SketchOverlay` note above for why).

Known gaps, not yet fixed: resizing an unfocused window doesn't bring it to front (react-rnd's resize handles sit outside the div the focus-capture handler is on); shrinking the browser doesn't re-clamp windows that end up partly off-screen.

## Theme

Tailwind's `dark:` variant is class-based (`@custom-variant dark` in `globals.css`), driven by `next-themes` (`ThemeProvider` in `theme-provider.tsx`, wired into `app/layout.tsx` with `suppressHydrationWarning`). For any client-only value that must match between server and first client render (mount state, the live clock in `MenuBarClock.tsx`), use `useSyncExternalStore` rather than `useState` + `useEffect` — the latter trips the `react-hooks/set-state-in-effect` lint rule and this codebase has standardized on the former.

## Mobile

Not built yet — below the `sm` breakpoint the whole desktop/window UI is replaced with a static "Mobile — coming soon" placeholder (CSS-only `sm:hidden`/`hidden sm:flex` swap, no JS breakpoint detection).

## Workflow for new features here

Use the `feature-dev` skill for anything that's a genuinely new feature (not routine fixes/config), and run the `code-simplifier` agent on the diff after implementing, before calling the work done.
