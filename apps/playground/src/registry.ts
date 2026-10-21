import type { ComponentType } from "react";
import type { ComponentMeta, DemoFrame, DemoSection } from "@buttery/core";
import { componentRoute } from "./routes.ts";

interface MetaModule {
  readonly meta: ComponentMeta;
}

interface DemoModule {
  readonly demos: readonly DemoSection[];
  readonly frame?: DemoFrame;
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

export interface Example {
  readonly title: string;
  readonly Component: ComponentType;
}

export interface ComponentEntry {
  readonly route: string;
  readonly meta: ComponentMeta;
  readonly demos: readonly DemoSection[];
  readonly frame: DemoFrame;
  readonly examples: readonly Example[];
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
      const Component = Object.values(module).find(isComponent);
      return Component ? [{ title: titleOf(path), Component }] : [];
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
      meta,
      demos: page?.demos ?? [],
      frame: page?.frame ?? "section",
      examples: examplesIn(folder),
    };
  })
  .sort((a, b) => a.meta.name.localeCompare(b.meta.name));
