import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defaultClientConditions, defineConfig } from "vite";
import manifest from "./package.json" with { type: "json" };

const { port } = manifest.config;

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: { conditions: ["@buttery/source", ...defaultClientConditions] },
  server: { port, strictPort: true },
  preview: { port: port + 2000, strictPort: true },
  build: { target: ["es2024", "safari17.5", "chrome130"] },
});
