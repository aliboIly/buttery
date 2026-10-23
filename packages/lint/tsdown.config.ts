import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    stylelint: "src/stylelint/index.ts",
    eslint: "src/eslint/index.ts",
  },
  platform: "node",
  fixedExtension: false,
  dts: true,
  sourcemap: true,
});
