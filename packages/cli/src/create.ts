import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  globSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import type { PackageManager } from "./package-manager.ts";
import { withDesktop } from "./templates.ts";
import type { TemplateName, Versions } from "./templates.ts";

/** What `buttery create` makes, and where its templates are. */
export interface CreateOptions {
  /** The folder to make the app in, which names it. */
  readonly directory: string;
  readonly template: TemplateName;
  /** Adds the Tauri shell, so the app also opens as a desktop window. */
  readonly desktop: boolean;
  /** Installs the app's packages once it's copied. */
  readonly install: boolean;
  readonly manager: PackageManager;
  readonly cwd: string;
  /** The command line's own `dist` folder, which holds the templates. */
  readonly dist: string;
  /**
   * A folder of packed `@butteryui/*` tarballs to install in place of the published packages, for testing
   * a release before it's published.
   */
  readonly tarballs?: string | undefined;
}

/** An app `buttery create` made. */
export interface Created {
  readonly path: string;
  readonly name: string;
  readonly installed: boolean;
}

const NAME = /^[a-z0-9][a-z0-9._-]*$/;

function readJson(path: string): Record<string, unknown> {
  const value: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${path} isn't a JSON object.`);
  }
  return Object.fromEntries(Object.entries(value));
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function readVersions(dist: string): Versions {
  const found = readJson(join(dist, "versions.json"));
  const record = (value: unknown): Record<string, string> =>
    typeof value === "object" && value !== null
      ? Object.fromEntries(
          Object.entries(value).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        )
      : {};
  return {
    buttery: typeof found["buttery"] === "string" ? found["buttery"] : "0.0.0",
    catalog: record(found["catalog"]),
    tools: record(found["tools"]),
  };
}

function renameIn(folder: string, from: string, to: string): void {
  const files = [
    "index.html",
    "AGENTS.md",
    "README.md",
    ...globSync("src/**/*.{ts,tsx}", { cwd: folder }),
    ...globSync("e2e/**/*.ts", { cwd: folder }),
  ];
  for (const file of files) {
    const path = join(folder, file);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    if (text.includes(from)) writeFileSync(path, text.replaceAll(from, to));
  }
}

function addDesktop(
  folder: string,
  dist: string,
  title: string,
  name: string,
): void {
  cpSync(join(dist, "desktop", "src-tauri"), join(folder, "src-tauri"), {
    recursive: true,
  });
  const config = join(folder, "src-tauri", "tauri.conf.json");
  const tauri = readJson(config);
  const app = tauri["app"];
  const windows: unknown =
    typeof app === "object" && app !== null
      ? Reflect.get(app, "windows")
      : undefined;
  writeJson(config, {
    ...tauri,
    productName: title,
    identifier: `app.${name.replaceAll(/[^a-z0-9]/g, "")}`,
    app: {
      ...(typeof app === "object" && app !== null ? app : {}),
      windows: Array.isArray(windows)
        ? windows.map((window: unknown): unknown =>
            typeof window === "object" && window !== null
              ? { ...window, title }
              : window,
          )
        : windows,
    },
  });
}

function pointAtTarballs(
  folder: string,
  tarballs: string,
  manager: PackageManager,
): void {
  const overrides = Object.fromEntries(
    readdirSync(tarballs)
      .map((file) => /^butteryui-([a-z]+)-.+\.tgz$/.exec(file))
      .filter((match): match is RegExpExecArray => match !== null)
      .map((match) => [
        `@butteryui/${match[1] ?? ""}`,
        `file:${join(resolve(tarballs), match[0])}`,
      ]),
  );
  if (manager === "pnpm") {
    writeFileSync(
      join(folder, "pnpm-workspace.yaml"),
      [
        "overrides:",
        ...Object.entries(overrides).map(
          ([name, path]) => `  "${name}": "${path}"`,
        ),
        "",
      ].join("\n"),
    );
    return;
  }
  const manifest = readJson(join(folder, "package.json"));
  writeJson(join(folder, "package.json"), { ...manifest, overrides });
}

/** Copies a template into a new folder, names the app after it, and installs its packages. */
export function createApp(options: CreateOptions): Created {
  const path = resolve(options.cwd, options.directory);
  const name = basename(path);
  if (!NAME.test(name)) {
    throw new Error(
      `"${name}" can't name a package. Fix: use lowercase letters, digits and dashes, such as my-app.`,
    );
  }
  if (existsSync(path) && readdirSync(path).length > 0) {
    throw new Error(
      `${options.directory} already has files in it. Fix: pick a new folder.`,
    );
  }
  const from = join(options.dist, "templates", options.template);
  cpSync(from, path, {
    recursive: true,
    filter: (source) => basename(source) !== "template.json",
  });
  renameSync(join(path, "_gitignore"), join(path, ".gitignore"));

  const { title: templateTitle } = readJson(join(from, "template.json"));
  const title = name.replaceAll("-", " ");
  if (typeof templateTitle === "string") renameIn(path, templateTitle, title);

  const versions = readVersions(options.dist);
  const manifest = { ...readJson(join(path, "package.json")), name };
  writeJson(
    join(path, "package.json"),
    options.desktop ? withDesktop(manifest, versions) : manifest,
  );
  if (options.desktop) addDesktop(path, options.dist, title, name);
  if (options.tarballs !== undefined)
    pointAtTarballs(path, options.tarballs, options.manager);

  let installed = false;
  if (options.install) {
    const result = spawnSync(options.manager, ["install"], {
      cwd: path,
      stdio: "inherit",
    });
    if (result.status !== 0) {
      throw new Error(
        `${options.manager} install didn't finish in ${options.directory}. Fix: run it there yourself and read what it says.`,
      );
    }
    installed = true;
  }
  return { path, name, installed };
}
