import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  exportedName,
  importedPackages,
  pageCode,
  pageNames,
} from "../../mcp/src/page-code.ts";
import type { PageNames } from "../../mcp/src/page-code.ts";
import { PAGE_FRAMES } from "../../mcp/src/scaffold.ts";
import type { PageKind } from "../../mcp/src/scaffold.ts";
import { PLACEMENTS, wiredDashboard } from "./pages.ts";
import type { PageTemplate } from "./pages.ts";
import { readJson } from "./project.ts";

/** A pattern `buttery add <pattern>` takes that starts from a page. */
export type PagePattern =
  "settings" | "onboarding" | "marketing-page" | "article";

/** The page each pattern that starts from a page is. */
export const PATTERN_PAGES: Readonly<Record<PagePattern, PageKind>> = {
  settings: "settings",
  onboarding: "onboarding",
  "marketing-page": "landing",
  article: "article",
};

/** A pattern `buttery add` takes: one that starts from a page, or `app-shell`, the frame around them. */
export type PatternName = PagePattern | "app-shell";

/** Whether `value` names a pattern `buttery add` takes. */
export function isPatternName(value: string): value is PatternName {
  return value === "app-shell" || Object.hasOwn(PATTERN_PAGES, value);
}

/** The pages in the command line's `dist/pages.json`, by kind. */
export function readPages(dist: string): ReadonlyMap<string, PageTemplate> {
  const pages = new Map<string, PageTemplate>();
  for (const [kind, value] of Object.entries(
    readJson(join(dist, "pages.json")),
  )) {
    if (typeof value !== "object" || value === null) continue;
    const component: unknown = Reflect.get(value, "component");
    const what: unknown = Reflect.get(value, "what");
    const code: unknown = Reflect.get(value, "code");
    if (
      typeof component === "string" &&
      typeof what === "string" &&
      typeof code === "string"
    ) {
      pages.set(kind, { component, what, code });
    }
  }
  return pages;
}

function dependencies(root: string): ReadonlySet<string> {
  const manifest = readJson(join(root, "package.json"));
  return new Set(
    ["dependencies", "devDependencies", "peerDependencies"].flatMap((field) => {
      const listed = manifest[field];
      return typeof listed === "object" && listed !== null
        ? Object.keys(listed)
        : [];
    }),
  );
}

function writeNew(root: string, file: string, code: string, fix: string): void {
  const path = join(root, file);
  if (existsSync(path)) throw new Error(`${file} already exists. Fix: ${fix}`);
  if (!existsSync(join(root, "src"))) {
    throw new Error(
      "There's no src folder here. Fix: run it in the app's folder, next to its package.json and src.",
    );
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, code);
}

/** What `buttery add page` wrote, and what's left to do. */
export interface AddedPage {
  readonly names: PageNames;
  readonly template: PageTemplate;
  /** Whether the page was wired into a dashboard app's `src/App.tsx`. */
  readonly wired: boolean;
  /** Packages the page imports that the app doesn't depend on yet. */
  readonly missing: readonly string[];
}

/** What `buttery add page` adds, to which app. */
export interface AddPageOptions {
  readonly root: string;
  /** The command line's own `dist` folder, which holds `pages.json`. */
  readonly dist: string;
  readonly kind: PageKind;
  /** The page's name, such as `"Customers"`; the example's own name when it's left out. */
  readonly name?: string | undefined;
}

/**
 * Writes a page from its pattern's whole-page example to `src/pages`, named after `name`, and wires it into
 * a dashboard app made from buttery's template: imported, in `routes`, in the page switch and the sidebar.
 */
export function addPage(options: AddPageOptions): AddedPage {
  const template = readPages(options.dist).get(options.kind);
  if (template === undefined) {
    throw new Error(
      `This copy of the command line has no ${options.kind} page. Fix: update @butteryui/cli.`,
    );
  }
  const names = pageNames(options.name ?? exportedName(template.code));
  const app = join(options.root, "src", "App.tsx");
  const wired = existsSync(app)
    ? wiredDashboard(readFileSync(app, "utf8"), names, PLACEMENTS[options.kind])
    : null;
  const code = pageCode(template.code, {
    frame: PAGE_FRAMES[options.kind],
    component: names.component,
    title: names.label,
    what: template.what,
  });
  writeNew(options.root, names.file, code, "pass --name with another name.");
  if (wired !== null) writeFileSync(app, wired);
  const installed = dependencies(options.root);
  return {
    names,
    template,
    wired: wired !== null,
    missing: importedPackages(code).filter((name) => !installed.has(name)),
  };
}

/** The frame `buttery add app-shell` writes, around the pages of an app called `title`. */
export function appFrame(title: string): string {
  return `import type { ReactElement, ReactNode } from "react";
import { AppShell, Sidebar, TopBar } from "@butteryui/react";
import { House, Settings } from "lucide-react";

/** The app's frame: a sidebar of its pages beside a top bar and the page at \`path\`. */
export function AppFrame({
  path,
  children,
}: {
  readonly path: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <AppShell
      layout="sidebar"
      sidebarLabel=${JSON.stringify(title)}
      sidebar={
        <Sidebar label=${JSON.stringify(title)}>
          <Sidebar.Item
            icon={House}
            label="Home"
            href="/"
            current={path === "/"}
          />
          <Sidebar.Item
            icon={Settings}
            label="Settings"
            href="/settings"
            current={path === "/settings"}
          />
        </Sidebar>
      }
      topBar={<TopBar />}
    >
      {children}
    </AppShell>
  );
}
`;
}

/** What `buttery add app-shell` wrote. */
export interface AddedFrame {
  readonly file: string;
  readonly missing: readonly string[];
}

/** Writes `src/AppFrame.tsx`, the shell to render the app's pages in, titled after `index.html`. */
export function addAppFrame(root: string): AddedFrame {
  const html = join(root, "index.html");
  const title =
    (existsSync(html)
      ? /<title>([^<]+)<\/title>/.exec(readFileSync(html, "utf8"))?.[1]?.trim()
      : undefined) ?? "App";
  const file = "src/AppFrame.tsx";
  const code = appFrame(title);
  writeNew(root, file, code, "rename or move the one you have.");
  const installed = dependencies(root);
  return {
    file,
    missing: importedPackages(code).filter((name) => !installed.has(name)),
  };
}
