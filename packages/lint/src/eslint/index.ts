import type { ESLint, Linter } from "eslint";
import { noLiteralLayoutStyle, spreadRestProps } from "./rules.ts";

/** The ESLint plugin with buttery's rules. */
export const butteryEslintPlugin: ESLint.Plugin = {
  meta: { name: "@buttery/lint" },
  rules: {
    "no-literal-layout-style": noLiteralLayoutStyle,
    "spread-rest-props": spreadRestProps,
  },
};

export interface ButteryEslintOptions {
  /** Where components live; they must spread their DOM props. Defaults to buttery's component folders. */
  readonly components?: readonly string[] | undefined;
  /** Files the rules skip, such as tests and fixtures. */
  readonly ignores?: readonly string[] | undefined;
}

/**
 * buttery's ESLint config: no literal margins, z-index, position or sizes in inline styles, and components
 * that accept DOM props spread the rest onto their root element.
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
      rules: { "buttery/no-literal-layout-style": "error" },
    },
    {
      files: [...components],
      ignores: [...ignores, "**/examples/**", "**/*.playground.tsx"],
      plugins: { buttery: butteryEslintPlugin },
      rules: { "buttery/spread-rest-props": "error" },
    },
  ];
}
