import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./create.ts";
import type { CreateOptions } from "./create.ts";

let root = "";

function write(path: string, text: string): void {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "buttery-create-"));
  write(
    "dist/templates/dashboard/template.json",
    JSON.stringify({ name: "dashboard", title: "buttery dashboard" }),
  );
  write(
    "dist/templates/dashboard/package.json",
    JSON.stringify({ name: "buttery-app", scripts: {}, devDependencies: {} }),
  );
  write(
    "dist/templates/dashboard/index.html",
    "<title>buttery dashboard</title>",
  );
  write(
    "dist/templates/dashboard/src/App.tsx",
    'const NAME = "buttery dashboard";\n',
  );
  write(
    "dist/templates/dashboard/e2e/smoke.spec.ts",
    '"Workspace: buttery dashboard"\n',
  );
  write("dist/templates/dashboard/_gitignore", "node_modules\n");
  write(
    "dist/versions.json",
    JSON.stringify({
      buttery: "0.11.0",
      catalog: { "@tauri-apps/cli": "^2.12.3" },
      tools: {},
    }),
  );
  write(
    "dist/desktop/src-tauri/tauri.conf.json",
    JSON.stringify({
      productName: "buttery starter",
      app: { windows: [{ title: "buttery starter" }] },
    }),
  );
  write("tarballs/butteryui-core-0.11.0.tgz", "");
  write("tarballs/butteryui-react-0.11.0.tgz", "");
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function options(overrides: Partial<CreateOptions> = {}): CreateOptions {
  return {
    directory: "corner-shop",
    template: "dashboard",
    desktop: false,
    install: false,
    manager: "pnpm",
    cwd: root,
    dist: join(root, "dist"),
    ...overrides,
  };
}

function read(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

describe("createApp", () => {
  it("copies the template, names the app after its folder and gives it a .gitignore", () => {
    const created = createApp(options());
    expect(created).toEqual({
      path: join(root, "corner-shop"),
      name: "corner-shop",
      installed: false,
    });
    expect(JSON.parse(read("corner-shop/package.json"))).toMatchObject({
      name: "corner-shop",
    });
    expect(read("corner-shop/index.html")).toBe("<title>corner shop</title>");
    expect(read("corner-shop/src/App.tsx")).toContain('"corner shop"');
    expect(read("corner-shop/e2e/smoke.spec.ts")).toContain(
      "Workspace: corner shop",
    );
    expect(existsSync(join(root, "corner-shop/.gitignore"))).toBe(true);
    expect(existsSync(join(root, "corner-shop/template.json"))).toBe(false);
  });

  it("adds the desktop shell, named for the app", () => {
    createApp(options({ desktop: true }));
    const tauri: unknown = JSON.parse(
      read("corner-shop/src-tauri/tauri.conf.json"),
    );
    expect(tauri).toMatchObject({
      productName: "corner shop",
      identifier: "app.cornershop",
      app: { windows: [{ title: "corner shop" }] },
    });
    expect(JSON.parse(read("corner-shop/package.json"))).toMatchObject({
      scripts: { tauri: "tauri" },
    });
  });

  it("installs packed tarballs in place of the published packages, for pnpm and for npm", () => {
    createApp(options({ tarballs: join(root, "tarballs") }));
    expect(read("corner-shop/pnpm-workspace.yaml")).toContain(
      `"@butteryui/core": "file:${join(root, "tarballs/butteryui-core-0.11.0.tgz")}"`,
    );
    createApp(
      options({
        directory: "other-shop",
        manager: "npm",
        tarballs: join(root, "tarballs"),
      }),
    );
    expect(JSON.parse(read("other-shop/package.json"))).toMatchObject({
      overrides: {
        "@butteryui/react": `file:${join(root, "tarballs/butteryui-react-0.11.0.tgz")}`,
      },
    });
  });

  it("says how to fix a folder name that can't name a package, or a folder with files in it", () => {
    expect(() => createApp(options({ directory: "Corner Shop" }))).toThrow(
      "Fix: use lowercase letters",
    );
    write("corner-shop/notes.txt", "mine");
    expect(() => createApp(options())).toThrow("Fix: pick a new folder.");
  });
});
