import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Layering, enforced. Imports point down only — see AGENTS.md:
 *
 *   4  src/system.tsx, src/app/       composition root: picks a shell, provides the app list
 *   3  src/apps/registry.ts           the one module that imports every app
 *   2  src/shells/*  src/apps/*       siblings; never import each other
 *   1  src/kernel/*  src/components/* shared foundation; knows about neither
 *
 * A shell needing the app list, or an app needing to reach the system, goes
 * through `@/kernel` (today: `useInstalledApps`) rather than importing across.
 */

/**
 * `no-restricted-imports` matches the literal specifier text — it never resolves
 * a path — so naming only `@/apps/**` leaves `../apps/…` wide open, and the
 * relative spelling is exactly how the `filesystem.ts` -> `registry` cycle got
 * written the first time. Every target therefore needs both spellings: the
 * alias, and a `../`-climb reaching the same module from any depth.
 */
function bothSpellings(...targets) {
  return targets.flatMap((target) => [`@/${target}`, `../**/${target}`]);
}

function forbid(files, group, message) {
  return {
    files,
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group, message }] }],
    },
  };
}

const layering = [
  forbid(
    ["src/kernel/**", "src/components/**"],
    bothSpellings("shells/**", "apps/**", "system"),
    "kernel and shared components are the bottom layer — they must not know about shells or apps. Invert the dependency: expose a contract here and let the caller pass what it needs in.",
  ),
  forbid(
    ["src/shells/**"],
    bothSpellings("apps/**"),
    "Shells are generic over the app registry. Get the app list from `useInstalledApps()` in @/kernel/installed-apps instead of importing apps directly.",
  ),
  forbid(
    ["src/apps/*/**"],
    [
      ...bothSpellings("shells/**", "apps/registry"),
      // An app climbing to its own sibling registry stays inside src/apps, so
      // the specifier drops the `apps/` segment the pattern above matches on.
      "../registry",
    ],
    "An app must not reach into a shell or the registry — that couples it to the desktop and breaks it under any other shell. Use the contract in @/kernel.",
  ),
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...layering,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
