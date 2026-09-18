"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AppDefinition } from "./app-definition";

const InstalledAppsContext = createContext<AppDefinition[] | null>(null);

/**
 * Hands the app list to the tree instead of letting anyone import the registry.
 *
 * Both sides need it — the Dock lists every app, Files lists /Applications —
 * and importing `apps/registry` from either would point an import back up the
 * layering (`apps/registry` is the one module allowed to know every app, and it
 * imports them all). It also gives tests a seam: render with two fake apps.
 */
export function InstalledAppsProvider({
  apps,
  children,
}: {
  apps: AppDefinition[];
  children: ReactNode;
}) {
  return (
    <InstalledAppsContext.Provider value={apps}>
      {children}
    </InstalledAppsContext.Provider>
  );
}

export function useInstalledApps(): AppDefinition[] {
  const apps = useContext(InstalledAppsContext);
  if (!apps) {
    throw new Error("useInstalledApps must be used inside <InstalledAppsProvider>");
  }
  return apps;
}
