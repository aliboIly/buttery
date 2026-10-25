import {
  fromJsonSchema,
  McpServer,
  ResourceNotFoundError,
  ResourceTemplate,
} from "@modelcontextprotocol/server";
import type {
  CallToolResult,
  GetPromptResult,
  ReadResourceResult,
} from "@modelcontextprotocol/server";
import { CHECK_WIDTHS, CheckRequestError, checkLayout } from "./check.ts";
import type { CheckReport, CheckWidth } from "./check.ts";
import { CALL_BUDGET, entryText, fitted, resolve } from "./get.ts";
import type { Detail } from "./get.ts";
import type { Knowledge, LoadedKnowledge } from "./knowledge.ts";
import { DIAGNOSTIC_LIMIT, LintRequestError, lint } from "./lint.ts";
import {
  PAGE_KIND_NAMES,
  PAGE_KINDS,
  ScaffoldRequestError,
  scaffold,
} from "./scaffold.ts";
import type { PageKind } from "./scaffold.ts";
import type { LintReport } from "./lint.ts";
import { SEARCH_KINDS } from "./search.ts";
import type { SearchKind, Searcher } from "./search.ts";
import { suggestionFor } from "./suggest.ts";

/** What one server instance answers from. */
export interface ServerSetup {
  readonly loaded: LoadedKnowledge;
  readonly searcher: Searcher;
  /** The app the server was started for, or `null` when none was found. */
  readonly projectRoot: string | null;
  /** The server's own version, as published. */
  readonly serverVersion: string;
  /** Origins besides this machine's that `buttery_check_layout` may open, from `BUTTERY_MCP_ALLOW_URLS`. */
  readonly allowedOrigins: readonly string[];
}

const HOUR = 3_600_000;
const PUBLIC_HOUR = { ttlMs: HOUR, cacheScope: "public" } as const;
const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

/** The server's instructions: what buttery is and the order to use the tools in, in under 800 characters. */
export function instructionsFor(knowledge: Knowledge): string {
  return [
    `buttery is the React design system this project builds its UI with (these docs: @butteryui/react ${knowledge.version}).`,
    "Before writing or changing UI, call buttery_search for the component, pattern or page to start from, then buttery_get with every id you need in one call for exact props and a working example, or buttery_scaffold for a whole page.",
    "After editing, run buttery_lint on the changed files and buttery_check_layout on the running app, and fix what they report.",
    'Props take tokens (gap={4}, never "16px"). Lay out with Stack, Inline or Grid and a gap; no outer or negative margins, no absolute positioning, one primary button per region.',
    "Not for non-UI code.",
  ].join(" ");
}

function text(body: string): CallToolResult {
  return { content: [{ type: "text", text: body }] };
}

function failure(body: string): CallToolResult {
  return { content: [{ type: "text", text: body }], isError: true };
}

function versionLine(loaded: LoadedKnowledge): string {
  const { knowledge, source, installed } = loaded;
  if (source === "project") return `buttery ${knowledge.version}`;
  if (installed === null) return `buttery ${knowledge.version}`;
  return installed === knowledge.version
    ? `buttery ${knowledge.version}`
    : `buttery ${knowledge.version} docs (the project has ${installed}; props may differ)`;
}

interface SearchArgs {
  readonly query: string;
  readonly kind?: SearchKind;
  readonly limit?: number;
}

interface GetArgs {
  readonly ids: readonly string[];
  readonly detail?: Detail;
}

function registerSearch(server: McpServer, setup: ServerSetup): void {
  server.registerTool(
    "buttery_search",
    {
      title: "Search buttery",
      description:
        'Find buttery components, page patterns, docs pages, props, tokens and layout rules by meaning or by name. Call it first, before writing UI: "modal" finds Dialog, "switch between three views" finds SegmentedControl, "settings page" finds the settings patterns. Each result is one line with the id to pass to buttery_get. Narrow with kind; an empty query with a kind lists everything of that kind.',
      inputSchema: fromJsonSchema<SearchArgs>({
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              'What to find, in plain words or a name, such as "modal", "toolbar that fits on a phone", "gap", "--bt-space-4" or "overlap". Leave it empty and set kind to list a kind.',
          },
          kind: {
            type: "string",
            enum: [...SEARCH_KINDS],
            description:
              "Only results of this kind: component (components, primitives and layers), pattern (page and app patterns), page (docs pages and their sections), guide, token, prop, example, or rule (layout rules and the checks that report them).",
          },
          limit: {
            type: "integer",
            minimum: 1,
            maximum: 25,
            description: "How many results to return, 8 if left out.",
          },
        },
        required: ["query"],
        additionalProperties: false,
      }),
      annotations: { title: "Search buttery", ...READ_ONLY },
      _meta: { "anthropic/alwaysLoad": true },
    },
    ({ query, kind, limit }) => {
      const results = setup.searcher.search(query, kind ?? null, limit ?? 8);
      const label =
        query.trim() === "" ? `every ${kind ?? "result"}` : `"${query.trim()}"`;
      if (results.items.length === 0) {
        return text(
          [
            `${versionLine(setup.loaded)}: nothing found for ${label}${kind === undefined ? "" : ` among ${kind} results`}.`,
            results.correction === null
              ? `Try fewer or plainer words, or list a kind: buttery_search({"query":"","kind":"component"}).`
              : `Did you mean "${results.correction}"? buttery_search({"query":${JSON.stringify(results.correction)}})`,
          ].join("\n"),
        );
      }
      const lines = results.items.map((item) => {
        const kindNote = item.kind === "component" ? "" : ` (${item.kind})`;
        const title =
          item.id.endsWith(`/${item.title}`) || item.kind === "component"
            ? ""
            : ` ${item.title}:`;
        return `- ${item.id}${kindNote}:${title} ${item.summary}`;
      });
      const top = [
        ...new Set(
          results.items
            .filter((item) => item.kind !== "rule" && item.kind !== "check")
            .slice(0, 4)
            .map((item) => item.id),
        ),
      ];
      return text(
        [
          `${versionLine(setup.loaded)}: ${String(results.total)} found for ${label}${results.total > results.items.length ? `, the best ${String(results.items.length)} shown` : ""}.`,
          ...lines,
          "",
          `Next: buttery_get(${JSON.stringify({ ids: top.length === 0 ? [results.items[0]?.id] : top })})`,
          ...(results.total > results.items.length
            ? [`More: raise limit, or narrow with kind or more words.`]
            : []),
        ].join("\n"),
      );
    },
  );
}

function registerGet(server: McpServer, setup: ServerSetup): void {
  server.registerTool(
    "buttery_get",
    {
      title: "Get buttery docs",
      description:
        "Exact details, for the buttery version this project uses, for up to 10 ids from buttery_search in one call. A component (component/Dialog, or just Dialog): its import, props with types and defaults, parts, the token values its props take, and a working example. A docs page (page/layout/responsive) or one section (page/layout/responsive#container-queries). A token group (tokens/space). A rule or check (check/overlap: the rule a layout violation names). An example's code (example/Toolbar/text-toolbar). detail \"full\" adds every part's props, accessibility, keyboard, motion and layout notes, and the component's examples.",
      inputSchema: fromJsonSchema<GetArgs>({
        type: "object",
        properties: {
          ids: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
            maxItems: 10,
            description:
              'Ids from buttery_search, such as ["component/Dialog", "component/Button", "tokens/space"]. Ask for everything a task needs in one call.',
          },
          detail: {
            type: "string",
            enum: ["summary", "full"],
            description:
              'How much to say about each: "summary" (the default) or "full".',
          },
        },
        required: ["ids"],
        additionalProperties: false,
      }),
      annotations: { title: "Get buttery docs", ...READ_ONLY },
      _meta: { "anthropic/alwaysLoad": true },
    },
    ({ ids, detail }) => {
      const { knowledge } = setup.loaded;
      const level = detail ?? "summary";
      const room = Math.max(3_000, Math.floor(CALL_BUDGET / ids.length));
      const found: string[] = [];
      const missing: string[] = [];
      for (const id of ids) {
        const entry = resolve(knowledge, id);
        if (entry === null) {
          const suggestion = suggestionFor(knowledge, setup.searcher, id);
          missing.push(
            suggestion === null
              ? `Nothing has the id "${id}". Find ids with buttery_search({"query":${JSON.stringify(id.split("/").at(-1) ?? id)}}).`
              : `Nothing has the id "${id}". Did you mean ${suggestion}? buttery_get({"ids":[${JSON.stringify(suggestion)}]})`,
          );
          continue;
        }
        found.push(fitted(entryText(knowledge, entry, level), room, entry));
      }
      if (found.length === 0) return failure(missing.join("\n"));
      return text(
        [
          versionLine(setup.loaded),
          "",
          found.join("\n\n---\n\n"),
          ...(missing.length === 0 ? [] : ["", ...missing]),
        ].join("\n"),
      );
    },
  );
}

interface ScaffoldArgs {
  readonly kind: "page" | "app";
  readonly page?: PageKind;
}

function registerScaffold(server: McpServer, setup: ServerSetup): void {
  server.registerTool(
    "buttery_scaffold",
    {
      title: "Start a page or an app",
      description: `Start a page from the buttery pattern made for it, as a file to save in the app: ${PAGE_KIND_NAMES.join(", ")}. Each compiles as it is and comes with the ids of the components it uses and how to check it. Or start an app: kind "app" gives the commands and the setup. Writes nothing; save the file yourself. Start here rather than from a blank file when building a whole page.`,
      inputSchema: fromJsonSchema<ScaffoldArgs>({
        type: "object",
        properties: {
          kind: {
            type: "string",
            enum: ["page", "app"],
            description: "What to start: a page of an app, or a new app.",
          },
          page: {
            type: "string",
            enum: [...PAGE_KIND_NAMES],
            description:
              "Which page, with kind page: table, detail, overview, settings, settings-index, catalog, plans, search-results, empty, feature-intro, sign-in, sign-up, onboarding, landing, article or faq.",
          },
        },
        required: ["kind"],
        additionalProperties: false,
      }),
      annotations: { title: "Start a page or an app", ...READ_ONLY },
    },
    ({ kind, page }) => {
      if (kind === "page" && page === undefined) {
        return failure(
          `Say which page. Fix: buttery_scaffold({"kind":"page","page":"settings"}); the pages: ${PAGE_KIND_NAMES.map((name) => `${name} (${PAGE_KINDS[name][2]})`).join("; ")}.`,
        );
      }
      try {
        return text(
          scaffold(
            setup.loaded.knowledge,
            kind === "app" || page === undefined
              ? { kind: "app" }
              : { kind: "page", page },
          ),
        );
      } catch (error) {
        if (error instanceof ScaffoldRequestError)
          return failure(error.message);
        throw error;
      }
    },
  );
}

interface LintArgs {
  readonly files?: readonly string[];
  readonly code?: string;
  readonly language?: "tsx" | "css";
}

interface CheckArgs {
  readonly url: string;
  readonly viewports?: readonly CheckWidth[];
  readonly themes?: readonly ("light" | "dark")[];
  readonly engine?: "chromium" | "webkit";
}

const DIAGNOSTIC_SCHEMA = {
  type: "object",
  properties: {
    file: { type: "string" },
    line: { type: "integer" },
    column: { type: "integer" },
    rule: { type: "string" },
    severity: { type: "string", enum: ["error", "warning"] },
    message: { type: "string" },
    fix: { type: "string" },
    docs: { type: "string" },
  },
  required: [
    "file",
    "line",
    "column",
    "rule",
    "severity",
    "message",
    "fix",
    "docs",
  ],
} as const;

const LINT_REPORT_SCHEMA = {
  type: "object",
  properties: {
    summary: {
      type: "object",
      properties: {
        files: { type: "integer" },
        errors: { type: "integer" },
        warnings: { type: "integer" },
        notes: { type: "array", items: { type: "string" } },
      },
      required: ["files", "errors", "warnings", "notes"],
    },
    diagnostics: { type: "array", items: DIAGNOSTIC_SCHEMA },
    truncated: { type: "boolean" },
  },
  required: ["summary", "diagnostics", "truncated"],
} as const;

const CHECK_REPORT_SCHEMA = {
  type: "object",
  properties: {
    summary: {
      type: "object",
      properties: {
        url: { type: "string" },
        conditions: { type: "integer" },
        violations: { type: "integer" },
        byRule: { type: "object", additionalProperties: { type: "integer" } },
      },
      required: ["url", "conditions", "violations", "byRule"],
    },
    violations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          rule: { type: "string" },
          a: { type: "string" },
          b: { type: ["string", "null"] },
          message: { type: "string" },
          fix: { type: "string" },
          conditions: { type: "array", items: { type: "string" } },
        },
        required: ["rule", "a", "b", "message", "fix", "conditions"],
      },
    },
    truncated: { type: "boolean" },
  },
  required: ["summary", "violations", "truncated"],
} as const;

function report(content: LintReport | CheckReport): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(content) }],
    structuredContent: { ...content },
  };
}

function registerLint(server: McpServer, setup: ServerSetup): void {
  server.registerTool(
    "buttery_lint",
    {
      title: "Lint with buttery's rules",
      description: `Check files in the project, or a snippet, against buttery's rules: raw colors, sizes and z-indexes, margins and positioning, layout animations, and literal prop values a component doesn't take (gap="16px" comes back as gap={4}). Runs the project's ESLint and stylelint with buttery's configs, and says how to set them up if they're missing. Each problem comes with its fix. Call it after editing UI, on the files you changed. Returns at most ${String(DIAGNOSTIC_LIMIT)} problems as JSON.`,
      inputSchema: fromJsonSchema<LintArgs>({
        type: "object",
        properties: {
          files: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
            maxItems: 50,
            description:
              'Paths or globs from the project root, such as ["src/pages/Settings.tsx"] or ["src/**/*.css"]. Give files or code, not both.',
          },
          code: {
            type: "string",
            maxLength: 20_000,
            description:
              "A snippet to check instead of files: a component in TSX, or CSS with language set to css.",
          },
          language: {
            type: "string",
            enum: ["tsx", "css"],
            description: "What code is written in, tsx if left out.",
          },
        },
        additionalProperties: false,
      }),
      outputSchema: fromJsonSchema<LintReport>(LINT_REPORT_SCHEMA),
      annotations: { title: "Lint with buttery's rules", ...READ_ONLY },
    },
    async ({ files, code, language }) => {
      if ((files === undefined) === (code === undefined)) {
        return failure(
          'Give files or code, one of them. Fix: buttery_lint({"files":["src/App.tsx"]}) or buttery_lint({"code":"<Stack gap={4}>…</Stack>"}).',
        );
      }
      try {
        return report(
          await lint(setup.loaded.knowledge, setup.projectRoot, {
            files,
            code,
            language,
          }),
        );
      } catch (error) {
        if (error instanceof LintRequestError) return failure(error.message);
        throw error;
      }
    },
  );
}

function registerCheck(server: McpServer, setup: ServerSetup): void {
  server.registerTool(
    "buttery_check_layout",
    {
      title: "Check a page's layout",
      description:
        "Open a page of the running app and run buttery's layout checks on it: overlap, overflow, text crowding and wrapping, sizes off the scale, small targets, controls out of line, contrast and the rest, at each width and theme asked for. Each problem comes once, with the selector, a fix and the conditions it showed in. Needs the app running locally and @playwright/test with @butteryui/test in the project; it says how to install what's missing. Call it after a change looks done.",
      inputSchema: fromJsonSchema<CheckArgs>({
        type: "object",
        properties: {
          url: {
            type: "string",
            description:
              'The page to check, as the dev server serves it, such as "http://localhost:5173/settings".',
          },
          viewports: {
            type: "array",
            items: { type: "integer", enum: [...CHECK_WIDTHS] },
            minItems: 1,
            maxItems: 6,
            description: "Widths to check at, 390 and 1280 if left out.",
          },
          themes: {
            type: "array",
            items: { type: "string", enum: ["light", "dark"] },
            minItems: 1,
            maxItems: 2,
            description: "Themes to check in, light if left out.",
          },
          engine: {
            type: "string",
            enum: ["chromium", "webkit"],
            description:
              "The browser engine, chromium if left out; webkit is closest to a desktop app on macOS.",
          },
        },
        required: ["url"],
        additionalProperties: false,
      }),
      outputSchema: fromJsonSchema<CheckReport>(CHECK_REPORT_SCHEMA),
      annotations: {
        title: "Check a page's layout",
        ...READ_ONLY,
        openWorldHint: true,
      },
    },
    async ({ url, viewports, themes, engine }) => {
      try {
        return report(
          await checkLayout(
            setup.projectRoot,
            { url, viewports, themes, engine },
            setup.allowedOrigins,
          ),
        );
      } catch (error) {
        if (error instanceof CheckRequestError) return failure(error.message);
        throw error;
      }
    },
  );
}

function markdown(uri: URL, body: string): ReadResourceResult {
  return {
    contents: [{ uri: uri.href, mimeType: "text/markdown", text: body }],
  };
}

function variable(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value.join("/") : (value ?? "");
}

function registerResources(server: McpServer, setup: ServerSetup): void {
  const { knowledge } = setup.loaded;
  server.registerResource(
    "docs",
    new ResourceTemplate("buttery://docs/{+path}", {
      list: () => ({
        resources: knowledge.pages.map((page) => ({
          uri: `buttery://docs/${page.route}`,
          name: page.route,
          title: page.title,
          description: page.description,
          mimeType: "text/markdown",
          size: page.markdown.length,
        })),
      }),
      complete: {
        path: (value) =>
          knowledge.pages
            .map((page) => page.route)
            .filter((route) => route.startsWith(value))
            .slice(0, 50),
      },
    }),
    {
      title: "buttery docs page",
      description:
        "A page of buttery's docs as Markdown, by its path on the site, such as layout/the-layout-contract or components/dialog.",
      mimeType: "text/markdown",
    },
    (uri, variables) => {
      const path = variable(variables["path"]);
      const page = knowledge.pages.find(
        (candidate) => candidate.route === path,
      );
      if (page) return markdown(uri, page.markdown);
      const component = knowledge.components.find(
        (candidate) => candidate.href === `/${path}`,
      );
      if (component) return markdown(uri, component.markdown);
      throw new ResourceNotFoundError(
        uri.href,
        `No docs page at ${path}. buttery://llms.txt lists every page.`,
      );
    },
  );
  server.registerResource(
    "component",
    new ResourceTemplate("buttery://component/{name}", {
      list: undefined,
      complete: {
        name: (value) =>
          knowledge.components
            .map((component) => component.name)
            .filter((name) =>
              name.toLowerCase().startsWith(value.toLowerCase()),
            )
            .slice(0, 50),
      },
    }),
    {
      title: "buttery component",
      description:
        "One component's import, props, parts, token values and an example, as buttery_get returns it, such as buttery://component/Dialog.",
      mimeType: "text/markdown",
    },
    (uri, variables) => {
      const name = variable(variables["name"]);
      const entry = resolve(knowledge, `component/${name}`);
      if (entry === null) {
        throw new ResourceNotFoundError(
          uri.href,
          `No component named ${name}. Find one with buttery_search.`,
        );
      }
      return markdown(uri, entryText(knowledge, entry, "summary"));
    },
  );
  server.registerResource(
    "tokens",
    new ResourceTemplate("buttery://tokens/{group}", {
      list: () => ({
        resources: knowledge.tokens.map((group) => ({
          uri: `buttery://tokens/${group.name}`,
          name: `tokens/${group.name}`,
          title: `${group.name} tokens`,
          mimeType: "text/markdown",
        })),
      }),
      complete: {
        group: (value) =>
          knowledge.tokens
            .map((group) => group.name)
            .filter((name) => name.startsWith(value)),
      },
    }),
    {
      title: "buttery tokens",
      description:
        "One group of design tokens with their values and what each is for, such as buttery://tokens/space or buttery://tokens/color.",
      mimeType: "text/markdown",
    },
    (uri, variables) => {
      const name = variable(variables["group"]);
      const entry = resolve(knowledge, `tokens/${name}`);
      if (entry === null) {
        throw new ResourceNotFoundError(
          uri.href,
          `No token group named ${name}. The groups: ${knowledge.tokens.map((group) => group.name).join(", ")}.`,
        );
      }
      return markdown(uri, entryText(knowledge, entry, "summary"));
    },
  );
  server.registerResource(
    "llms",
    "buttery://llms.txt",
    {
      title: "buttery llms.txt",
      description:
        "Every page of buttery's docs, by section, with a link to its Markdown.",
      mimeType: "text/markdown",
    },
    (uri) => markdown(uri, knowledge.llms),
  );
}

function prompt(body: string): GetPromptResult {
  return {
    messages: [{ role: "user", content: { type: "text", text: body } }],
  };
}

interface PageArgs {
  readonly kind: string;
}

interface ReviewArgs {
  readonly target: string;
}

function registerPrompts(server: McpServer, setup: ServerSetup): void {
  const { knowledge } = setup.loaded;
  server.registerPrompt(
    "make-it-buttery",
    {
      title: "Make it buttery",
      description:
        "Build new UI or convert existing UI to buttery, step by step: tokens, components, motion and layout with nothing overlapping.",
    },
    () => prompt(knowledge.skill),
  );
  server.registerPrompt(
    "build-page",
    {
      title: "Build a page",
      description:
        "Build one page of an app with buttery, such as settings, table, detail or catalog, starting from its pattern.",
      argsSchema: fromJsonSchema<PageArgs>({
        type: "object",
        properties: {
          kind: {
            type: "string",
            description:
              "The page to build, in one word, such as settings, table, detail, catalog, plans or empty.",
          },
        },
        required: ["kind"],
        additionalProperties: false,
      }),
    },
    ({ kind }) =>
      prompt(
        [
          `Build a ${kind} page with buttery.`,
          `1. buttery_search({"query":"${kind} page","kind":"pattern"}) and buttery_search({"query":"${kind} page","kind":"page"}) to find the pattern and the page to start from.`,
          "2. buttery_get every component the page needs in one call, and start from the pattern's example rather than from scratch.",
          "3. Lay it out with the page's pattern and Stack, Inline or Grid with gaps; use tokens for every size and color.",
          "4. Run buttery_lint on the files you changed and buttery_check_layout on the running page, and fix everything they report.",
        ].join("\n"),
      ),
  );
  server.registerPrompt(
    "review-ui",
    {
      title: "Review UI",
      description:
        "Check a running page or a source file against buttery's rules and fix what's wrong.",
      argsSchema: fromJsonSchema<ReviewArgs>({
        type: "object",
        properties: {
          target: {
            type: "string",
            description:
              "A URL of a running page, such as http://localhost:5173/settings, or a source file, such as src/pages/Settings.tsx.",
          },
        },
        required: ["target"],
        additionalProperties: false,
      }),
    },
    ({ target }) =>
      prompt(
        /^https?:\/\//.test(target)
          ? `Review ${target} with buttery: run buttery_check_layout({"url":${JSON.stringify(target)}}), read each violation's fix, change the source that renders it, and check again until nothing is reported. Then run buttery_lint on the files you changed.`
          : `Review ${target} with buttery: run buttery_lint({"files":[${JSON.stringify(target)}]}), fix each issue as its fix says, and use buttery_search and buttery_get for any component you're unsure of. Then check the running page with buttery_check_layout.`,
      ),
  );
}

/** One server instance: buttery's tools, resources and prompts over `setup`, cheap to build twice. */
export function createButteryServer(setup: ServerSetup): McpServer {
  const server = new McpServer(
    { name: "buttery", title: "buttery", version: setup.serverVersion },
    {
      instructions: instructionsFor(setup.loaded.knowledge),
      cacheHints: {
        "server/discover": PUBLIC_HOUR,
        "tools/list": PUBLIC_HOUR,
        "prompts/list": PUBLIC_HOUR,
        "resources/list": PUBLIC_HOUR,
        "resources/templates/list": PUBLIC_HOUR,
        "resources/read": PUBLIC_HOUR,
      },
    },
  );
  registerSearch(server, setup);
  registerGet(server, setup);
  registerScaffold(server, setup);
  registerLint(server, setup);
  registerCheck(server, setup);
  registerResources(server, setup);
  registerPrompts(server, setup);
  return server;
}
