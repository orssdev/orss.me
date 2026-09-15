import { terminalApp } from "./terminal/TerminalApp";
import { notesApp } from "./notes/NotesApp";
import type { AppDefinition } from "./types";

export const apps: AppDefinition[] = [terminalApp, notesApp];
