import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { Note } from "./types";

const NOTES_DIR = path.join(process.cwd(), "src/apps/notes/content");

/** Frontmatter YAML dates parse as `Date` objects; normalize to an ISO string. */
function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : "";
}

/** First non-empty line of the body, markdown syntax stripped, for the sidebar row. */
function toPreview(body: string): string {
  const firstLine = body
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (!firstLine) return "No additional text";

  return firstLine
    .replace(/^#+\s*/, "")
    .replace(/^(?:[-*]|\d+\.)\s+/, "")
    .replace(/[*_`]/g, "");
}

export async function readNotes(): Promise<Note[]> {
  const files = (await readdir(NOTES_DIR)).filter((f) => f.endsWith(".md"));

  const notes = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(NOTES_DIR, file), "utf8");
      const { data, content } = matter(raw);
      const slug = file.replace(/\.md$/, "");
      const trimmedContent = content.trim();
      return {
        slug,
        title: typeof data.title === "string" ? data.title : slug,
        date: toIsoDate(data.date),
        preview: toPreview(trimmedContent),
        content: trimmedContent,
      };
    }),
  );

  // Dates are ISO strings, so lexicographic order is chronological order.
  return notes.sort((a, b) => b.date.localeCompare(a.date));
}
