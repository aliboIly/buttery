import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    stylelint: "src/stylelint/index.ts",
    eslint: "src/eslint/index.ts",
  },
  platform: "node",
  dts: true,
  sourcemap: true,
});
