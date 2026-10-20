import { heights, space, zIndex } from "../tokens/index.ts";
import type { LayoutCheckTokens } from "./checks.ts";

/** The token values `runLayoutChecks` compares against, from the token tables. */
export function layoutCheckTokens(): LayoutCheckTokens {
  return {
    space: Object.values(space),
    heightVars: Object.keys(heights).map((name) => `--bt-h-${name}`),
    zIndex: Object.values(zIndex),
  };
}
