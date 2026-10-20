import { butteryStylelintConfig } from "./packages/lint/src/stylelint/index.ts";

export default {
  ...butteryStylelintConfig(),
  ignoreFiles: [
    "**/dist/**",
    "**/.tsbuild/**",
    "**/coverage/**",
    "playwright-report/**",
    "test-results/**",
    "apps/*/src-tauri/**",
    "reference/**",
  ],
};
