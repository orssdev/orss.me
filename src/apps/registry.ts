import type { AppDefinition } from "@/kernel/app-definition";
import { filesApp } from "./files/FilesApp";
import { notesApp } from "./notes/NotesApp";
import { terminalApp } from "./terminal/TerminalApp";

export const apps: AppDefinition[] = [filesApp, terminalApp, notesApp];
