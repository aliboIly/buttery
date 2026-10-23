import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    palettes: "src/palettes/index.ts",
    layout: "src/layout/index.ts",
  },
  platform: "neutral",
  unbundle: true,
  dts: true,
  sourcemap: true,
});
