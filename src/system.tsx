"use client";

import { apps } from "@/apps/registry";
import { InstalledAppsProvider } from "@/kernel/installed-apps";
import { Desktop } from "@/shells/desktop";

/**
 * Composition root: the only module that picks a shell and knows the app list
 * as a value. It's a Client Component because an `AppDefinition` carries a
 * component, which can't cross the server/client boundary as a prop — so the
 * registry has to be imported inside the client bundle rather than passed down
 * from the (server) page.
 */
export function System() {
  return (
    <InstalledAppsProvider apps={apps}>
      <Desktop />
    </InstalledAppsProvider>
  );
}
