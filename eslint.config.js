// This configuration only applies to the package manager root.
import { libraryConfig } from "./packages/eslint-config/library.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...libraryConfig,
  {
    ignores: ["apps/**", "packages/**"],
  },
];
