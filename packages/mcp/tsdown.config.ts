import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  platform: "node",
  dts: false,
  sourcemap: true,
  fixedExtension: false,
});
