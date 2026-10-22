import type { ComponentType } from "react";
import type {
  ComponentMeta,
  DemoFrame,
  DemoSection,
  DocsPage,
  LiveDemo,
} from "@buttery/core";
import { componentRoute } from "./routes.ts";

interface MetaModule {
  readonly meta: ComponentMeta;
}

interface DemoModule {
  readonly demos: readonly DemoSection[];
  readonly frame?: DemoFrame;
  readonly page?: DocsPage;
  readonly live?: LiveDemo;
}

const metaModules = import.meta.glob<MetaModule>(
  "../../../packages/*/src/**/*.meta.ts",
  { eager: true },
);
const demoModules = import.meta.glob<DemoModule>(
  "../../../packages/*/src/**/*.playground.tsx",
  { eager: true },
);
const exampleModules = import.meta.glob<Readonly<Record<string, unknown>>>(
  "../../../packages/*/src/**/examples/*.tsx",
  { eager: true },
);
const exampleCode = import.meta.glob<ExampleCode>(
  "../../../packages/*/src/**/examples/*.tsx",
  { eager: true, query: "?code", import: "default" },
);

/** An example file's source, highlighted at build time, and the caption its JSDoc gives it. */
export interface ExampleCode {
  readonly source: string;
  readonly html: string;
  readonly caption: string;
}

export interface Example {
  /** Its file's name without the extension, such as `basic`. */
  readonly name: string;
  readonly title: string;
  readonly Component: ComponentType;
  readonly code: ExampleCode;
}

export interface ComponentEntry {
  /** Its name in kebab case, such as `fit-box`; its page's path adds its section in front. */
  readonly route: string;
  /** Where its page sits on the site, from its `*.playground.tsx`; undefined until it has one. */
  readonly page: DocsPage | undefined;
  /** Its folder from the repository's root, such as `packages/react/src/components/button`. */
  readonly folder: string;
  readonly meta: ComponentMeta;
  readonly demos: readonly DemoSection[];
  readonly frame: DemoFrame;
  readonly examples: readonly Example[];
  /** Its page's live demo with prop controls, from its `*.playground.tsx`; undefined until it has one. */
  readonly live: LiveDemo | undefined;
}

function folderOf(path: string): string {
  return path.slice(0, path.lastIndexOf("/"));
}

function titleOf(path: string): string {
  const base = path.slice(path.lastIndexOf("/") + 1).replace(/\.tsx$/, "");
  const words = base.replaceAll("-", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function isComponent(value: unknown): value is ComponentType {
  return typeof value === "function";
}

function examplesIn(folder: string): Example[] {
  return Object.entries(exampleModules)
    .filter(([path]) => folderOf(folderOf(path)) === folder)
    .flatMap(([path, module]) => {
      const Component = Object.entries(module).find(
        ([name, value]) => name !== "play" && isComponent(value),
      )?.[1];
      const code = exampleCode[path];
      return isComponent(Component) && code
        ? [
            {
              name: path.slice(path.lastIndexOf("/") + 1, -".tsx".length),
              title: titleOf(path),
              Component,
              code,
            },
          ]
        : [];
    });
}

/** Every component with a manifest entry, its demos and its examples, by name. */
export const components: readonly ComponentEntry[] = Object.entries(metaModules)
  .map(([path, { meta }]) => {
    const folder = folderOf(path);
    const page = Object.entries(demoModules).find(
      ([demoPath]) => folderOf(demoPath) === folder,
    )?.[1];
    return {
      route: componentRoute(meta.name),
      page: page?.page,
      folder: folder.replace(/^(\.\.\/)+/, ""),
      meta,
      demos: page?.demos ?? [],
      live: page?.live,
      frame: page?.frame ?? "section",
      examples: examplesIn(folder),
    };
  })
  .sort((a, b) => a.meta.name.localeCompare(b.meta.name));
