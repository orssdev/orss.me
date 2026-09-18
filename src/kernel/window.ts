/**
 * Named window sizes an `AppDefinition` opts into for `defaultSize`/`minSize`.
 *
 * Lives in the kernel because it's part of the app contract, while the pixels
 * behind each name and every other window concept (bounds, state, stacking)
 * belong to the windowing shell — a shell without windows ignores these.
 */
export type WindowSizePreset = "small" | "medium" | "fullscreen";
