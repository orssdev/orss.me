"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

function NoteRow({
  note,
  isSelected,
  onSelect,
}: {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const formattedDate = formatDate(note.date);
  const meta = formattedDate ? `${formattedDate} ${note.preview}` : note.preview;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`block w-full border-b border-zinc-200 px-4 py-3 text-left dark:border-white/10 ${
        isSelected
          ? "bg-zinc-200 dark:bg-white/10"
          : "hover:bg-zinc-100 dark:hover:bg-white/5"
      }`}
    >
      <div className="truncate font-semibold">{note.title}</div>
      <div className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
        {meta}
      </div>
    </button>
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

  return notes.map((note) => (
    <NoteRow
      key={note.slug}
      note={note}
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
      <div className="w-64 shrink-0 overflow-auto border-r border-zinc-300 dark:border-white/20">
        <NoteList
          notes={notes}
          selectedSlug={selectedSlug}
          onSelect={setSelectedSlug}
        />
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
};
