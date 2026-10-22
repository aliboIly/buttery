import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defaultClientConditions, defineConfig } from "vite";
import type { Plugin } from "vite";
import manifest from "./package.json" with { type: "json" };

const { port } = manifest.config;

const REFERENCE_MODULE = "virtual:buttery-reference";

/**
 * Tells the local Compare page where the reference captures are. They're never committed or built: the
 * dev server serves them from the repo's reference folder when it's there, and builds get `null`.
 */
function referenceCaptures(): Plugin {
  const folder = fileURLToPath(new URL("../../reference", import.meta.url));
  let serving = false;
  return {
    name: "buttery-reference",
    configResolved(config) {
      serving = config.command === "serve";
    },
    resolveId(source) {
      return source === REFERENCE_MODULE ? `\0${REFERENCE_MODULE}` : undefined;
    },
    load(id) {
      if (id !== `\0${REFERENCE_MODULE}`) return undefined;
      const root = serving && existsSync(folder) ? `/@fs${folder}` : null;
      return `export const referenceRoot = ${JSON.stringify(root)};`;
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    referenceCaptures(),
  ],
  resolve: { conditions: ["@buttery/source", ...defaultClientConditions] },
  server: { port, strictPort: true },
  preview: { port: port + 2000, strictPort: true },
  build: { target: ["es2024", "safari17.5", "chrome130"] },
});
