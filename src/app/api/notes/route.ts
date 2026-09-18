import { NextResponse } from "next/server";
import { readNotes } from "@/apps/notes/notes.server";

export async function GET() {
  const notes = await readNotes();
  return NextResponse.json(notes);
}
