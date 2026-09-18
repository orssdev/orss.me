<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## What this is

A hand-drawn/sketchy "desktop OS" prototype — a personal hobby site styled like a pencil sketch, with a menu bar, a dock, and apps that open as draggable/resizable floating windows. Stack: Next.js (App Router) + React + TypeScript + Tailwind v4, `roughjs` for the hand-drawn rendering, `react-rnd` for window drag/resize, `next-themes` for light/dark.

## Architecture

All code lives under `src/`; the repo root is config only. `src/app/` is **routing only** — no component, hook, or helper belongs there.

```
src/
  app/                  routing: layout.tsx, page.tsx, api/, globals.css, fonts/
  system.tsx            composition root — picks a shell, provides the app list
  kernel/               the contract shells and apps share
    app-definition.ts     AppDefinition
    window.ts             WindowSizePreset
    installed-apps.tsx    InstalledAppsProvider / useInstalledApps
  shells/
    desktop/            windows, dock, menu bar, window-manager.ts
  apps/
    registry.ts         the one module that imports every app
    files/  notes/  terminal/
  components/
    sketch/             shared hand-drawn primitives
    theme-provider.tsx
```

### The layering rule

Imports point **down only**:

```
4  src/system.tsx, src/app/        composition root
3  src/apps/registry.ts            knows every app
2  src/shells/*   src/apps/*       siblings; never import each other
1  src/kernel/*   src/components/* shared foundation; knows about neither
```

This is enforced by `no-restricted-imports` in `eslint.config.mjs` — `npm run lint` fails on a violation, with a message explaining the fix. Don't weaken those rules to make an import work; the import is the thing that's wrong.

Consequences worth internalizing:

- **A shell never imports an app**, including the registry. It gets the app list from `useInstalledApps()`. That's what makes a second shell (mobile, tablet) possible without touching app code.
- **An app never imports a shell.** An app that assumes it's in a window breaks under any shell that has no windows.
- **`kernel/` and `components/sketch/` never import from `shells/` or `apps/`.** If something down here needs to know about an app, invert it: take the data as a parameter. `filesystem.ts`'s `applicationEntries(apps)` is the worked example — it used to import the registry, which created a real circular import (`filesystem` → `registry` → `FilesApp` → `filesystem`).
- **`src/system.tsx` is a Client Component on purpose.** An `AppDefinition` carries a `Content` component, and components can't cross the server/client boundary as props — so the registry has to be imported inside the client bundle rather than passed down from the (server) `page.tsx`.

Use the `@/` alias (→ `src/`) for anything outside your own folder; relative imports are for siblings in the same directory.

### Where does a new file go?

- Clickable/drawable thing any shell could reuse → `components/sketch/`
- Part of the windowed desktop UI → `shells/desktop/`
- New app → `apps/<name>/` + one line in `apps/registry.ts`
- Something both a shell and an app must agree on → `kernel/`

## Typography

The mono face is Monaspace Radon (Nerd Font patched) — a handwriting-styled monospace chosen deliberately for the sketch vibe, and Nerd-Font-patched so a future Terminal app can render icon glyphs. Self-hosted via `next/font/local` in `src/app/layout.tsx` (files under `src/app/fonts/`, license at `src/app/fonts/LICENSE.txt`), exposed as the CSS custom property `--font-radon`, which `globals.css` maps to Tailwind's `--font-mono` — so it's just `font-mono`, same as before. Don't reach for a Google Font or another local mono face here without deliberately revisiting this choice; it's load-bearing for the whole UI's identity, not an incidental pick. `Geist` (sans) is unrelated leftover boilerplate — nothing in the app opts into `font-sans`.

## Sketch rendering (`src/components/sketch/rough-utils.tsx`)

Every hand-drawn border/shape goes through this file's shared `generator` (a `rough.generator()` instance), `SKETCH_OPTIONS`, `roundedRectPath`/`insetRoundedRectPath`, and the `SketchOverlay` component (the `<svg>` wrapper around `drawablesToPaths`). Reuse these instead of calling `rough.generator()` or writing a rounded-rect path elsewhere.

`SketchOverlay` must keep `preserveAspectRatio="none"`. Its `viewBox` can briefly disagree with the rendered box (a component that recomputes its paths on an interaction *stop* rather than every frame, a CSS-driven size change), and without that attribute the SVG letterboxes instead of stretching, visually detaching the border from the box — this was a real regression once already.

The flip side: a stretched overlay is only safe for shapes whose *whole* geometry should scale with the box. Anything drawn at a fixed pixel offset — `FloatingWindow`'s title-bar divider at `y = TITLE_BAR_HEIGHT` — drifts away from the fixed-height DOM element it's supposed to sit under as soon as the viewBox is stale, so such overlays must track the live box size (see the window manager note below).

`rough-utils.tsx` also exports `ScribbleHighlight` (a hachure-filled rough rectangle, stretched like any other overlay — the sketched stand-in for a flat selected/hover background color) and `ScribbleLine`/`ScribbleDivider` (a single wobbly rough line, optionally pre-pinned to one edge of its positioned parent — the stand-in for a straight CSS `border-b`/`border-r`). Nothing in this UI should fall back to a flat Tailwind `bg-zinc-*` highlight or a plain CSS border for something the user selects, hovers, or that structurally divides two panes — draw it with these instead, the same way shapes go through `SketchOverlay` rather than raw SVG.

## Clickable sketch tiles (`src/components/sketch/PressableSketch.tsx`)

The shared primitive for anything clickable in this style: draws a rough outline plus an offset "shadow" copy, lifts on hover and presses onto its own shadow on click/tap — all via CSS transforms, no JS. `SketchButton`, `DockIcon`, `DesktopIcon`, and `ThemeToggle` all build on this. New clickable sketch elements should too, rather than re-implementing the hover/press effect.

## Selectable list rows (`src/components/sketch/ScribbleRow.tsx`)

The equivalent shared primitive for a row in a list (a sidebar entry, a file/note listing row): layers a hover `ScribbleHighlight`, a differently-seeded selected `ScribbleHighlight`, and a bottom `ScribbleDivider` behind the row's content. `NoteRow` (Notes) and the sidebar/entry rows (Files) both build on it — new row lists should too, rather than reaching for `bg-zinc-200`/`border-b`. Callers thread in a per-row `seed` via the `rowSeed(base, index)` helper it exports (e.g. `rowSeed(NOTE_SEED_BASE, i)`) so sibling rows don't all draw the identical squiggle, and `contentClassName` when a row's content needs to be laid out as a flex row instead of the default block stack.

One gotcha specific to `ScribbleDivider`: it's `position: absolute`, so if it's placed *inside* a scrolling (`overflow-auto`) container it scrolls away with the content instead of staying pinned to the pane edge. Wrap the scrollable content in its own inner `overflow-auto` div, and put the divider as a sibling of that inner div inside a non-scrolling `relative` outer wrapper (see the sidebar in `NotesApp.tsx` or `FilesApp.tsx`).

## Apps (`src/apps/`)

Each app is a folder under `src/apps/<name>/` exporting an `AppDefinition` (`src/kernel/app-definition.ts`: `id`, `label`, `glyph`, `menu`, `Content`, optional `defaultSize`/`minSize`). `src/apps/registry.ts` is the single list, injected into the tree by `src/system.tsx` and read via `useInstalledApps()` — `Dock`, `MenuBar`, and the window manager in `Desktop.tsx` are all generic over `AppDefinition` and never special-case an app by id. Adding an app means "new folder + one line in the registry," not touching shell internals.

An app that needs server-side data keeps it in a `*.server.ts` file importing `server-only`, with the wire types in a separate `types.ts` the client component can import — see `apps/notes/`. Colocating `node:fs` code beside a `"use client"` component without that split is a live landmine: it only works while every import of it is type-only.

Watch `notes.server.ts`'s `NOTES_DIR`: it's a `process.cwd()`-relative string, so a directory move breaks it silently at runtime rather than failing the build. Grep for it before moving `apps/`.

## Desktop shell / window manager (`src/shells/desktop/`)

`Desktop.tsx` is a client component (window state can't live in a Server Component) owning `windows: Record<appId, WindowState>` (position/size/z-index/minimized/maximized) and `focusedAppId`. Model is **singleton-per-app**: one window per app; clicking its dock icon again focuses/un-minimizes rather than opening a duplicate. `FloatingWindow.tsx` wraps `react-rnd` for the drag/resize mechanics while keeping our own rough.js chrome as the visual layer. Bounds are committed to `Desktop.tsx` on drag/resize *stop* only, but the chrome itself follows a local `liveSize` updated on every `onResize` frame, so the title-bar divider and corner radii stay pinned mid-resize; `liveSize` is cleared on stop. Feeding the live size back into `Rnd`'s `size` prop is safe — `re-resizable` renders from its own internal state while `isResizing`.

Window sizing is a named-preset system (`WindowSizePreset` in `src/kernel/window.ts`: `"small"` | `"medium"` | `"fullscreen"`), not free-form pixels. The type lives in the kernel because it's part of the app contract; the pixels behind each name, and every other window concept, live in `shells/desktop/window-manager.ts`. An `AppDefinition` opts into `defaultSize` (what `centeredWindow` opens it at — defaults to `"small"`) and `minSize` (the floor `FloatingWindow` resolves via `presetSize` and passes to `Rnd` as `minWidth`/`minHeight` — also defaults to `"small"`). `minSize: "fullscreen"` has no fixed pixel size to enforce as a floor, so it's implemented instead by pinning the window (`disableDragging`/`enableResizing` both off, same treatment as `isMaximized`) rather than by measuring the live screen.

Known gaps, not yet fixed: resizing an unfocused window doesn't bring it to front (react-rnd's resize handles sit outside the div the focus-capture handler is on); shrinking the browser doesn't re-clamp windows that end up partly off-screen.

## Theme

Tailwind's `dark:` variant is class-based (`@custom-variant dark` in `globals.css`), driven by `next-themes` (`ThemeProvider` in `src/components/theme-provider.tsx`, wired into `src/app/layout.tsx` with `suppressHydrationWarning`). For any client-only value that must match between server and first client render (mount state, the live clock in `MenuBarClock.tsx`), use `useSyncExternalStore` rather than `useState` + `useEffect` — the latter trips the `react-hooks/set-state-in-effect` lint rule and this codebase has standardized on the former.

## Mobile & tablet

Not built yet — the desktop/window UI only renders at `lg` and up. Below that it's two static CSS-only placeholders, no JS breakpoint detection: under `sm`, "Mobile — coming soon"; from `sm` to `lg` (tablet-ish widths), "Tablet — coming soon". All three tiers are mutually exclusive `hidden`/`flex` swaps keyed off the same breakpoints in `Desktop.tsx`.

## Roadmap — planned, NOT yet built

None of this exists yet. It's recorded here so incremental work moves toward it instead of away from it; don't describe any of it as present.

**Syscalls.** `AppDefinition.Content` currently takes no props, so an app has no channel to ask the system for anything — which is why `/Applications` in Files renders `Notes.app` but double-clicking it does nothing (`FilesApp.tsx` only wires `onDoubleClick` for directories). The fix is a `SystemCalls` interface in `kernel/` (`open`, `openPath`, `close`, `focus`), implemented by whichever shell is mounted and consumed by apps through context, exactly like `useInstalledApps` already works. Apps still never import a shell. Do this before wiring any app-to-app interaction by hand.

**Window identity.** Window state is keyed by app id (`Record<appId, WindowState>`), i.e. singleton-per-app. Two photos, two terminals, or two folder windows all break that. Re-key to `Record<windowId, { windowId, appId, intent } & WindowState>` with `windowId === appId` for apps that declare `singleton: true`. This touches `Desktop`, `Dock`, `MenuBar`, and `FloatingWindow`, so **do it before the app count grows** — the blast radius only increases.

**File handlers.** Once syscalls exist, `AppDefinition` gains `handles?: string[]` (`[".md"]`, `[".jpg"]`) and `Content` takes an optional `LaunchIntent` (`{ path?, args? }`), so `openPath("/Pictures/sunset.jpg")` resolves to an app via the registry.

**Filesystem into the kernel.** `apps/files/filesystem.ts` is currently a Files-app detail, which is right for today. It becomes `kernel/fs/` as soon as a second consumer appears (Terminal's `ls`/`cd`/`cat`, a Photos app, or syscall handler resolution). Related: there are effectively two filesystems right now — the hardcoded tree in `filesystem.ts` and the real markdown behind `apps/notes/notes.server.ts` — and `/Documents` shows fake entries. Unifying them is the interesting problem, and it wants the VFS in the kernel first.

**More shells.** `shells/` is plural for a reason. Mobile and tablet are not the desktop restyled; they're sibling shells over the same kernel and the same apps, each implementing `SystemCalls` differently ("open" = spawn a window vs. push a full-screen view). Two rules make that work:

- **Apps use container queries; shells use viewport breakpoints.** An app must adapt to *its own box*, not the viewport — a 400px-wide window and a phone screen are the same problem. Tailwind v4 ships `@container` in core. `NotesApp.tsx`'s hardcoded `w-64` sidebar is the current violation.
- **Render one shell, not three.** Today's three tiers are CSS `hidden`/`flex` swaps, which is fine for static placeholders but means three live component trees once they're real. Switch to `matchMedia` behind `useSyncExternalStore` (the pattern this codebase already standardizes on) and mount exactly one.

**Code splitting.** `registry.ts` statically imports every app, so all app code ships on first paint. `next/dynamic` per registry entry gives each app its own chunk.

**Tests.** There are none. `shells/desktop/window-manager.ts` and `apps/files/filesystem.ts` are pure functions over plain data and are the obvious first targets — and with parallel work in separate lanes, tests are the only thing that tells one lane it broke another.

## Workflow for new features here

Use the `feature-dev` skill for anything that's a genuinely new feature (not routine fixes/config), and run the `code-simplifier` agent on the diff after implementing, before calling the work done. `npm run build` and `npm run lint` should both pass; lint is what enforces the layering rule above.
