"use client";

import { Fragment, useState } from "react";
import { ScribbleDivider } from "../../components/rough-utils";
import { rowSeed, ScribbleRow } from "../../components/ScribbleRow";
import {
  HOME_PATH,
  listDirectory,
  pathTrail,
  type FsEntry,
  type FsLocation,
} from "../../lib/filesystem";
import type { AppDefinition } from "../types";

const SIDEBAR_LOCATIONS: FsLocation[] = [
  { name: "Home", path: HOME_PATH },
  { name: "Documents", path: "/Documents" },
  { name: "Pictures", path: "/Pictures" },
  { name: "Applications", path: "/Applications" },
];

/** Arbitrary but distinct seeds, so each sketched element draws its own squiggle. */
const LOCATION_SEED_BASE = 100;
const SIDEBAR_DIVIDER_SEED = 190;
const BREADCRUMB_DIVIDER_SEED = 290;
const ENTRY_SEED_BASE = 300;

function entryGlyph(entry: FsEntry): string {
  switch (entry.type) {
    case "directory":
      return "▸";
    case "app":
      return entry.glyph;
    case "file":
      return "▫";
  }
}

function EntryRow({
  entry,
  seed,
  isSelected,
  onSelect,
  onOpen,
}: {
  entry: FsEntry;
  seed: number;
  isSelected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  return (
    <ScribbleRow
      seed={seed}
      isSelected={isSelected}
      onClick={onSelect}
      onDoubleClick={entry.type === "directory" ? onOpen : undefined}
      contentClassName="flex items-center gap-2"
    >
      <span className="w-4 shrink-0 text-center">{entryGlyph(entry)}</span>
      <span className="truncate">{entry.name}</span>
    </ScribbleRow>
  );
}

function Breadcrumb({
  trail,
  onNavigate,
}: {
  trail: FsLocation[];
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1 truncate">
      {trail.map((crumb, i) => (
        <Fragment key={crumb.path}>
          {i > 0 && (
            <span className="shrink-0 text-zinc-400 dark:text-zinc-600">/</span>
          )}
          <button
            type="button"
            onClick={() => onNavigate(crumb.path)}
            className={`shrink-0 ${
              i === trail.length - 1
                ? "font-semibold"
                : "text-zinc-500 hover:underline dark:text-zinc-400"
            }`}
          >
            {crumb.name}
          </button>
        </Fragment>
      ))}
    </div>
  );
}

function FilesContent() {
  const [path, setPath] = useState(HOME_PATH);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const entries = listDirectory(path) ?? [];
  const trail = pathTrail(path);

  function navigate(next: string) {
    setPath(next);
    setSelectedPath(null);
  }

  return (
    <div className="flex h-full font-mono text-sm">
      {/* the divider hangs off this non-scrolling wrapper, so it stays pinned
          to the panel edge instead of scrolling away with the list */}
      <div className="relative w-40 shrink-0">
        <div className="h-full overflow-auto">
          {SIDEBAR_LOCATIONS.map((location, i) => (
            <ScribbleRow
              key={location.path}
              seed={rowSeed(LOCATION_SEED_BASE, i)}
              isSelected={path === location.path}
              onClick={() => navigate(location.path)}
            >
              {location.name}
            </ScribbleRow>
          ))}
        </div>
        <ScribbleDivider seed={SIDEBAR_DIVIDER_SEED} orientation="vertical" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative shrink-0 px-4 py-2">
          <Breadcrumb trail={trail} onNavigate={navigate} />
          <ScribbleDivider seed={BREADCRUMB_DIVIDER_SEED} />
        </div>
        <div className="flex-1 overflow-auto">
          {entries.length === 0 && (
            <div className="p-4 text-zinc-500">This folder is empty.</div>
          )}
          {entries.map((entry, i) => (
            <EntryRow
              key={entry.path}
              entry={entry}
              seed={rowSeed(ENTRY_SEED_BASE, i)}
              isSelected={entry.path === selectedPath}
              onSelect={() => setSelectedPath(entry.path)}
              onOpen={() => navigate(entry.path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const filesApp: AppDefinition = {
  id: "files",
  label: "Files",
  glyph: "▦",
  menu: ["File", "Edit", "View", "Go", "Window", "Help"],
  Content: FilesContent,
};
