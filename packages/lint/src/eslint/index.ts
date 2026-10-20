import type { ESLint, Linter } from "eslint";
import {
  noLiteralLayoutStyle,
  noRawMotionLayout,
  spreadRestProps,
  tailwindTokens,
} from "./rules.ts";

/** The ESLint plugin with buttery's rules. */
export const butteryEslintPlugin: ESLint.Plugin = {
  meta: { name: "@buttery/lint" },
  rules: {
    "no-literal-layout-style": noLiteralLayoutStyle,
    "no-raw-motion-layout": noRawMotionLayout,
    "spread-rest-props": spreadRestProps,
    "tailwind-tokens": tailwindTokens,
  },
};

/** Options for `butteryEslintConfig`. */
export interface ButteryEslintOptions {
  /** Where components live; they must spread their DOM props. Defaults to buttery's component folders. */
  readonly components?: readonly string[] | undefined;
  /** Files the rules skip, such as tests and fixtures. */
  readonly ignores?: readonly string[] | undefined;
  /**
   * Check Tailwind classes against the tokens: no positioning, raw arbitrary values, Tailwind palette or
   * off-scale spacing. Defaults to `true`; turn it off if your own class names collide with Tailwind's.
   */
  readonly tailwind?: boolean | undefined;
}

/**
 * buttery's ESLint config: no literal margins, z-index, position or sizes in inline styles, layout
 * animation on motion elements only through `useLayoutAnimation`, Tailwind classes that go through the
 * tokens, and components that accept DOM props spread the rest onto their root element.
 *
 * @example
 * // eslint.config.js
 * import { butteryEslintConfig } from "@buttery/lint/eslint";
 * export default [...yourConfig, ...butteryEslintConfig()];
 */
export function butteryEslintConfig(
  options: ButteryEslintOptions = {},
): Linter.Config[] {
  const ignores = [
    "**/*.test.tsx",
    "**/*.test.ts",
    "**/e2e/**",
    ...(options.ignores ?? []),
  ];
  const components = options.components ?? [
    "**/primitives/**/*.tsx",
    "**/layers/**/*.tsx",
    "**/components/**/*.tsx",
    "**/patterns/**/*.tsx",
  ];
  return [
    {
      files: ["**/*.tsx", "**/*.jsx"],
      ignores,
      plugins: { buttery: butteryEslintPlugin },
      rules: {
        "buttery/no-literal-layout-style": "error",
        "buttery/no-raw-motion-layout": "error",
        ...(options.tailwind === false
          ? {}
          : { "buttery/tailwind-tokens": "error" }),
      },
    },
    {
      files: [...components],
      ignores: [...ignores, "**/examples/**", "**/*.playground.tsx"],
      plugins: { buttery: butteryEslintPlugin },
      rules: { "buttery/spread-rest-props": "error" },
    },
  ];
}
