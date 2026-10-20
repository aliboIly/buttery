import { defineConfig } from "tsdown";

export default defineConfig({
  entry: { index: "src/index.ts", palettes: "src/palettes/index.ts" },
  platform: "neutral",
  dts: true,
  sourcemap: true,
});
