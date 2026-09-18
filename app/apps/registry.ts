import { filesApp } from "./files/FilesApp";
import { notesApp } from "./notes/NotesApp";
import { terminalApp } from "./terminal/TerminalApp";
import type { AppDefinition } from "./types";

export const apps: AppDefinition[] = [filesApp, terminalApp, notesApp];
