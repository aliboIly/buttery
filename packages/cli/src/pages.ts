import type { PageNames } from "../../mcp/src/page-code.ts";
import type { PageKind } from "../../mcp/src/scaffold.ts";

/** A page `buttery add page` writes: its pattern's component, what the page is for, and its code. */
export interface PageTemplate {
  readonly component: string;
  readonly what: string;
  readonly code: string;
}

/**
 * Where a page goes in a dashboard app: in the shell, behind a sidebar item with its icon from
 * `lucide-react`, or on a screen of its own, as signing in is.
 */
export type Placement =
  | { readonly kind: "shell"; readonly icon: string }
  | { readonly kind: "screen" };

/** Where each kind of page goes when `buttery add page` wires it into a dashboard app. */
export const PLACEMENTS: Readonly<Record<PageKind, Placement>> = {
  table: { kind: "shell", icon: "List" },
  detail: { kind: "shell", icon: "FileText" },
  overview: { kind: "shell", icon: "LayoutDashboard" },
  settings: { kind: "shell", icon: "SlidersHorizontal" },
  "settings-index": { kind: "shell", icon: "Settings2" },
  catalog: { kind: "shell", icon: "Package" },
  plans: { kind: "shell", icon: "CreditCard" },
  "search-results": { kind: "shell", icon: "Search" },
  empty: { kind: "shell", icon: "Inbox" },
  "feature-intro": { kind: "shell", icon: "Sparkles" },
  "sign-in": { kind: "screen" },
  "sign-up": { kind: "screen" },
  onboarding: { kind: "screen" },
  landing: { kind: "screen" },
  article: { kind: "screen" },
  faq: { kind: "screen" },
};

/** Whether `value` is a kind of page `buttery add page` knows. */
export function isPageKind(value: string): value is PageKind {
  return Object.hasOwn(PLACEMENTS, value);
}

function importLine(names: readonly string[], from: string): string {
  const line = `import { ${names.join(", ")} } from "${from}";`;
  return line.length <= 80
    ? line
    : `import {\n${names.map((name) => `  ${name},`).join("\n")}\n} from "${from}";`;
}

function withIcon(app: string, icon: string): string {
  const found = /^import\s+\{([^}]*)\}\s+from\s+"lucide-react";$/m.exec(app);
  if (found === null) {
    const imports = [...app.matchAll(/^import[\s\S]*?;$/gm)].at(-1);
    const at = imports === undefined ? 0 : imports.index + imports[0].length;
    return `${app.slice(0, at)}\n${importLine([icon], "lucide-react")}${app.slice(at)}`;
  }
  const names = (found[1] ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name !== "");
  if (names.includes(icon)) return app;
  const sorted = [...names, icon].sort((a, b) => a.localeCompare(b));
  return app.replace(found[0], importLine(sorted, "lucide-react"));
}

function withPageImport(app: string, names: PageNames): string | null {
  const path = `./${names.file.slice("src/".length)}`;
  const line = `import { ${names.component} } from "${path}";`;
  const imports = [
    ...app.matchAll(/^import \{[^}]*\} from "(\.\/pages\/[^"]+)";$/gm),
  ];
  const last = imports.at(-1);
  if (last === undefined) return null;
  const next = imports.find(
    (match) => (match[1] ?? "").localeCompare(path) > 0,
  );
  if (next !== undefined) {
    return `${app.slice(0, next.index)}${line}\n${app.slice(next.index)}`;
  }
  const at = last.index + last[0].length;
  return `${app.slice(0, at)}\n${line}${app.slice(at)}`;
}

function insertAfter(
  text: string,
  pattern: RegExp,
  insert: string,
): string | null {
  const matches = [...text.matchAll(pattern)];
  const last = matches.at(-1);
  if (last === undefined) return null;
  const at = last.index + last[0].length;
  return `${text.slice(0, at)}${insert}${text.slice(at)}`;
}

/**
 * `app`, a dashboard template's `src/App.tsx`, with the page wired in: imported, its path in `routes`,
 * and either a case in the page switch and an item in the sidebar, or a screen of its own. Null when
 * `app` doesn't have the template's shape any more, so the page can't be wired in for certain.
 */
export function wiredDashboard(
  app: string,
  names: PageNames,
  placement: Placement,
): string | null {
  if (new RegExp(`^\\s*"${names.route}",$`, "m").test(app)) {
    throw new Error(
      `The app already has a page at ${names.route}. Fix: pass --name with another name.`,
    );
  }
  let wired = withPageImport(app, names);
  if (wired === null) return null;
  wired = insertAfter(
    wired,
    /^export const routes: readonly string\[\] = \[\n(?: {2}"[^"]*",\n)*/gm,
    `  "${names.route}",\n`,
  );
  if (wired === null) return null;
  if (placement.kind === "screen") {
    return insertAfter(
      wired,
      /^ {2}if \(path === "[^"]+"\) return <\w+[^>]*\/>;$/gm,
      `\n  if (path === "${names.route}") return <${names.component} />;`,
    );
  }
  const withCase = wired.replace(
    /^( {4})default:\n( {6})return <NotFoundPage \/>;$/m,
    `$1case "${names.route}":\n$2return <${names.component} />;\n$1default:\n$2return <NotFoundPage />;`,
  );
  if (withCase === wired) return null;
  const sidebar = /^( *)<\/Sidebar>$/m.exec(withCase);
  if (sidebar === null) return null;
  const indent = `${sidebar[1] ?? ""}  `;
  const item = [
    `${indent}<Sidebar.Item`,
    `${indent}  icon={${placement.icon}}`,
    `${indent}  label="${names.label}"`,
    `${indent}  href={link("${names.route}")}`,
    `${indent}  current={path === "${names.route}"}`,
    `${indent}/>`,
    "",
  ].join("\n");
  const withItem = `${withCase.slice(0, sidebar.index)}${item}${withCase.slice(sidebar.index)}`;
  return withIcon(withItem, placement.icon);
}
