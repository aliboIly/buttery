import { existsSync, globSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import mdx from "@mdx-js/rollup";
import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import {
  defaultClientConditions,
  defaultServerConditions,
  defineConfig,
} from "vite";
import type { Plugin } from "vite";
import manifest from "./package.json" with { type: "json" };
import { docsBase } from "./src/base.ts";
import { exampleCode } from "./vite/code.ts";
import { butteryDates } from "./vite/dates.ts";
import { frontmatter } from "./vite/frontmatter.ts";
import { butteryProps } from "./vite/props.ts";
import { butterySearch } from "./vite/search.ts";
import { butteryMarkdown } from "./vite/markdown.ts";
import { butteryRoadmap, roadmapHeadings, roadmapIn } from "./vite/roadmap.ts";
import {
  butteryWhatsNew,
  latestReleaseHeadings,
  releaseHeadings,
  releasesIn,
} from "./vite/whats-new.ts";
import { butteryDemoUses } from "./vite/demo-uses.ts";
import { rehypeHighlight } from "./vite/highlight.ts";

const { port } = manifest.config;

const root = fileURLToPath(new URL("../..", import.meta.url));

const REFERENCE_MODULE = "virtual:buttery-reference";

/**
 * Tells the local Compare page where the reference captures are. They're never committed or built: the
 * dev server serves them from the repo's reference folder when it's there, and builds get `null`.
 */
function referenceCaptures(): Plugin {
  const folder = fileURLToPath(new URL("../../reference", import.meta.url));
  let serving = false;
  let base = "/";
  return {
    name: "buttery-reference",
    configResolved(config) {
      serving = config.command === "serve";
      base = config.base;
    },
    resolveId(source) {
      return source === REFERENCE_MODULE ? `\0${REFERENCE_MODULE}` : undefined;
    },
    load(id) {
      if (id !== `\0${REFERENCE_MODULE}`) return undefined;
      const root = serving && existsSync(folder) ? `${base}@fs${folder}` : null;
      return `export const referenceRoot = ${JSON.stringify(root)};`;
    },
  };
}

export default defineConfig({
  base: docsBase(process.env["BUTTERY_DOCS_BASE"]),
  plugins: [
    butteryProps(fileURLToPath(new URL("../..", import.meta.url))),
    butteryDates(fileURLToPath(new URL("../..", import.meta.url))),
    butterySearch(fileURLToPath(new URL("../..", import.meta.url))),
    butteryMarkdown(fileURLToPath(new URL("../..", import.meta.url))),
    butteryWhatsNew(fileURLToPath(new URL("../..", import.meta.url))),
    butteryRoadmap(root),
    butteryDemoUses(fileURLToPath(new URL("../..", import.meta.url))),
    exampleCode(),
    frontmatter({
      generated: {
        WhatsNew: () => releaseHeadings(releasesIn(root)),
        LatestRelease: () => latestReleaseHeadings(releasesIn(root)),
        Roadmap: () => roadmapHeadings(roadmapIn(root)),
      },
      watch: () => [
        join(root, "ROADMAP.md"),
        ...globSync("apps/docs/content/whats-new/*.md", { cwd: root }).map(
          (file) => join(root, file),
        ),
      ],
    }),
    {
      enforce: "pre",
      ...mdx({ jsxImportSource: "react", rehypePlugins: [rehypeHighlight] }),
    },
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    referenceCaptures(),
  ],
  resolve: { conditions: ["@butteryui/source", ...defaultClientConditions] },
  // The static build renders every page on the server from source, the packages' and the apps', as the dev server does.
  ssr: {
    noExternal: [/^@butteryui\//, /^demo-/, /^template-/, "starter"],
    resolve: { conditions: ["@butteryui/source", ...defaultServerConditions] },
  },
  server: { port, strictPort: true },
  preview: { port: port + 2000, strictPort: true },
  build: { target: ["es2024", "safari17.5", "chrome130"] },
});
