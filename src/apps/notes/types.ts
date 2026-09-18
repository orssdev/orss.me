/**
 * The shape a note takes once it's crossed the wire. Kept apart from
 * `notes.server.ts` so the client component can import it without pulling
 * `node:fs` into the browser bundle.
 */
export interface Note {
  slug: string;
  title: string;
  date: string;
  preview: string;
  content: string;
}
