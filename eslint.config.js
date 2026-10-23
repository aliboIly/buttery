import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";
import { butteryEslintConfig } from "./packages/lint/src/eslint/index.ts";

const reactRuleMessage =
  "React 19 takes ref as a prop and compound components share state through context. See AGENTS.md.";

export default defineConfig(
  globalIgnores([
    "**/dist/",
    "**/.tsbuild/",
    "**/coverage/",
    "playwright-report/",
    "test-results/",
    "apps/*/src-tauri/",
    "reference/",
    "notes/",
    "apps/docs/lab/docs-check/",
  ]),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              importNames: [
                "forwardRef",
                "cloneElement",
                "FC",
                "FunctionComponent",
              ],
              message: reactRuleMessage,
            },
          ],
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "as", objectLiteralTypeAssertions: "never" },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        {
          considerDefaultExhaustiveForUnions: false,
          requireDefaultForNonUnion: true,
        },
      ],
      "@typescript-eslint/no-restricted-types": [
        "error",
        {
          types: {
            "React.FC": reactRuleMessage,
            "React.FunctionComponent": reactRuleMessage,
          },
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended, jsxA11y.flatConfigs.strict],
    rules: {
      // A region that scrolls takes focus so the keyboard can scroll it (axe: scrollable-region-focusable).
      "jsx-a11y/no-noninteractive-tabindex": [
        "error",
        { tags: [], roles: ["tabpanel", "region"] },
      ],
      // A list that's laid out keeps role="list": Safari drops a list's role along with its markers.
      "jsx-a11y/no-redundant-roles": [
        "error",
        { nav: ["navigation"], ul: ["list"], ol: ["list"] },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["packages/*/src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-exports": [
        "error",
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],
    },
  },
  ...butteryEslintConfig(),
);
