"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScribbleDivider } from "../../components/rough-utils";
import { rowSeed, ScribbleRow } from "../../components/ScribbleRow";
import type { AppDefinition } from "../types";
import type { Note } from "./lib";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
    timeZone: "UTC",
  });
}

/** Arbitrary but distinct seeds, so each sketched element draws its own squiggle. */
const SIDEBAR_DIVIDER_SEED = 200;
const NOTE_SEED_BASE = 300;

function NoteRow({
  note,
  seed,
  isSelected,
  onSelect,
}: {
  note: Note;
  seed: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const formattedDate = formatDate(note.date);
  const meta = formattedDate ? `${formattedDate} ${note.preview}` : note.preview;

  return (
    <ScribbleRow seed={seed} isSelected={isSelected} onClick={onSelect} className="py-3">
      <div className="truncate font-semibold">{note.title}</div>
      <div className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
        {meta}
      </div>
    </ScribbleRow>
  );
}

/** Sidebar body: loading placeholder, empty state, or the selectable note rows. */
function NoteList({
  notes,
  selectedSlug,
  onSelect,
}: {
  notes: Note[] | null;
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}) {
  if (notes === null) return <div className="p-4 text-zinc-500">Loading…</div>;
  if (notes.length === 0) return <div className="p-4 text-zinc-500">No notes yet.</div>;

  return notes.map((note, i) => (
    <NoteRow
      key={note.slug}
      note={note}
      seed={rowSeed(NOTE_SEED_BASE, i)}
      isSelected={note.slug === selectedSlug}
      onSelect={() => onSelect(note.slug)}
    />
  ));
}

function NotesContent() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/notes")
      .then((res) => res.json())
      .then((data: Note[]) => {
        if (cancelled) return;
        setNotes(data);
        setSelectedSlug((current) => current ?? data[0]?.slug ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = notes?.find((note) => note.slug === selectedSlug) ?? null;

  return (
    <div className="flex h-full font-mono text-sm">
      {/* the divider hangs off this non-scrolling wrapper, so it stays pinned
          to the panel edge instead of scrolling away with the list */}
      <div className="relative w-64 shrink-0">
        <div className="h-full overflow-auto">
          <NoteList
            notes={notes}
            selectedSlug={selectedSlug}
            onSelect={setSelectedSlug}
          />
        </div>
        <ScribbleDivider seed={SIDEBAR_DIVIDER_SEED} orientation="vertical" />
      </div>
      <div className="min-w-0 flex-1 overflow-auto p-6">
        {selected && (
          <article className="prose prose-sm prose-zinc max-w-none dark:prose-invert">
            <h1>{selected.title}</h1>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{selected.content}</ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}

export const notesApp: AppDefinition = {
  id: "notes",
  label: "Notes",
  glyph: "▤",
  menu: ["File", "Edit", "View", "Window", "Help"],
  Content: NotesContent,
  defaultSize: "medium",
  minSize: "medium",
};
