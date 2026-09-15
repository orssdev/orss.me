import type { ComponentType } from "react";

/** Everything the desktop shell needs to list, launch, and chrome an app. */
export interface AppDefinition {
  id: string;
  label: string;
  /** Dock icon glyph. */
  glyph: string;
  /** Top menu bar items shown while this app is active. */
  menu: string[];
  /** Renders inside AppScreen — fills the space between the menu bar and the dock. */
  Content: ComponentType;
}
