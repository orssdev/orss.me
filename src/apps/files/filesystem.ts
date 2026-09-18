import type { AppDefinition } from "@/kernel/app-definition";

/** A listing row: enough to render or navigate to it, nothing app-specific. */
export type FsEntry =
  | { type: "directory"; name: string; path: string }
  | { type: "file"; name: string; path: string }
  | { type: "app"; name: string; path: string; glyph: string; appId: string };

/** A named place to navigate to — a breadcrumb step or a sidebar shortcut. */
export interface FsLocation {
  name: string;
  path: string;
}

interface DirNode {
  type: "directory";
  name: string;
  children: TreeNode[];
}
interface FileNode {
  type: "file";
  name: string;
}
type TreeNode = DirNode | FileNode;

/** Home is the root of the virtual tree — there's nothing above it to navigate to. */
const HOME: DirNode = {
  type: "directory",
  name: "orss",
  children: [
    {
      type: "directory",
      name: "Documents",
      children: [
        { type: "file", name: "resume.pdf" },
        { type: "file", name: "notes-to-self.txt" },
        {
          type: "directory",
          name: "Projects",
          children: [{ type: "file", name: "orss.me.txt" }],
        },
      ],
    },
    {
      type: "directory",
      name: "Pictures",
      children: [
        { type: "file", name: "sunset.jpg" },
        { type: "file", name: "desk-setup.png" },
        { type: "file", name: "sketch.png" },
      ],
    },
    // Filled in by the caller's `applicationEntries` — see listDirectory below.
    { type: "directory", name: "Applications", children: [] },
  ],
};

export const HOME_PATH = "/";
const APPLICATIONS_PATH = "/Applications";

/** Splits into clean segments, dropping "" and "." and applying ".." (clamped at home). */
function segmentsOf(path: string): string[] {
  const segments: string[] = [];
  for (const segment of path.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") segments.pop();
    else segments.push(segment);
  }
  return segments;
}

/** Collapses "//", trailing slashes, and ".." (clamped at home) into a clean "/a/b" path. */
export function normalizePath(path: string): string {
  return "/" + segmentsOf(path).join("/");
}

export function joinPath(parent: string, name: string): string {
  return normalizePath(`${parent}/${name}`);
}

function findNode(path: string): TreeNode | null {
  let node: TreeNode = HOME;
  for (const segment of segmentsOf(path)) {
    if (node.type !== "directory") return null;
    // Annotation required: inferring `next` from the reassigned `node` is circular (TS7022).
    const next: TreeNode | undefined = node.children.find(
      (child) => child.name === segment,
    );
    if (!next) return null;
    node = next;
  }
  return node;
}

/**
 * /Applications is generated from the installed apps rather than stored in the
 * tree. The list is passed in rather than imported: the registry imports every
 * app, so reaching for it from here would point an import back up the layering.
 */
export function applicationEntries(apps: AppDefinition[]): FsEntry[] {
  return apps.map((app) => {
    const name = `${app.label}.app`;
    return {
      type: "app",
      name,
      path: joinPath(APPLICATIONS_PATH, name),
      glyph: app.glyph,
      appId: app.id,
    };
  });
}

/** Breadcrumb from Home down to `path`, inclusive. */
export function pathTrail(path: string): FsLocation[] {
  const trail: FsLocation[] = [{ name: HOME.name, path: HOME_PATH }];
  let current = HOME_PATH;
  for (const segment of segmentsOf(path)) {
    current = joinPath(current, segment);
    trail.push({ name: segment, path: current });
  }
  return trail;
}

/** Lists a directory's contents, or null if `path` doesn't exist or isn't a directory. */
export function listDirectory(
  path: string,
  appEntries: FsEntry[],
): FsEntry[] | null {
  const normalized = normalizePath(path);
  if (normalized === APPLICATIONS_PATH) return appEntries;

  const node = findNode(normalized);
  if (!node || node.type !== "directory") return null;

  return node.children
    .map(
      (child): FsEntry => ({
        type: child.type,
        name: child.name,
        path: joinPath(normalized, child.name),
      }),
    )
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}
