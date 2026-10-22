import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TEMPLATES, createApp, usedPorts } from "./new-app.mjs";

let root;

function write(path, content) {
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(
    join(root, path),
    typeof content === "string" ? content : JSON.stringify(content),
  );
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function app(folder, { name, port, title, source }) {
  write(`${folder}/package.json`, {
    name,
    private: true,
    config: { port },
    scripts: { dev: "vite" },
  });
  write(
    `${folder}/index.html`,
    `<!doctype html>\n<title>${title}</title>\n<script type="module" src="/src/main.tsx"></script>\n`,
  );
  write(`${folder}/src/App.tsx`, source);
  write(
    `${folder}/tsconfig.json`,
    `{ "extends": "${"../".repeat(folder.split("/").length)}tooling/tsconfig/app.json" }\n`,
  );
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "buttery-new-app-"));
  write("tsconfig.json", { files: [], references: [{ path: "./apps/docs" }] });
  app("apps/docs", { name: "docs", port: 5173, title: "buttery", source: "" });
  app("apps/starter", {
    name: "starter",
    port: 5174,
    title: "buttery starter",
    source: 'export const heading = "🧈 buttery starter";\n',
  });
  write(
    "apps/starter/e2e/smoke.spec.ts",
    'expect(heading).toHaveText("🧈 buttery starter");\n',
  );
  write("apps/starter/src-tauri/tauri.conf.json", {
    productName: "buttery starter",
    identifier: "dev.buttery.starter",
    build: { devUrl: "http://localhost:5174" },
    app: { windows: [{ title: "buttery starter", width: 1280 }] },
  });
  write("apps/starter/src-tauri/target/debug/huge", "left behind");
  app("apps/templates/dashboard", {
    name: "template-dashboard",
    port: 5175,
    title: "buttery dashboard",
    source: 'const NAME = "buttery dashboard";\n',
  });
  write(
    "apps/templates/dashboard/e2e/layout.spec.ts",
    'getByRole("button", { name: "Workspace: buttery dashboard" });\n',
  );
  app("apps/demos/roastery", {
    name: "demo-roastery",
    port: 5180,
    title: "Halfmoon Roastery",
    source: "",
  });
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("usedPorts", () => {
  it("reads the ports of the apps, the templates and the demos, a folder down", () => {
    expect(usedPorts(root).sort()).toEqual([5173, 5174, 5175, 5180]);
  });
});

describe("createApp", () => {
  it("copies the starter for blank, desktop shell included, on the next free port", () => {
    const made = createApp({
      root,
      name: "plant-shop",
      install: false,
      format: false,
    });
    expect(made).toEqual({
      folder: "apps/plant-shop",
      port: 5181,
      desktop: true,
    });
    expect(JSON.parse(read("apps/plant-shop/package.json"))).toMatchObject({
      name: "plant-shop",
      config: { port: 5181 },
    });
    expect(read("apps/plant-shop/index.html")).toContain(
      "<title>plant shop</title>",
    );
    expect(read("apps/plant-shop/src/App.tsx")).toContain('"🧈 plant shop"');
    expect(read("apps/plant-shop/e2e/smoke.spec.ts")).toContain(
      '"🧈 plant shop"',
    );
    expect(
      JSON.parse(read("apps/plant-shop/src-tauri/tauri.conf.json")),
    ).toEqual({
      productName: "plant shop",
      identifier: "dev.buttery.plant-shop",
      build: { devUrl: "http://localhost:5181" },
      app: { windows: [{ title: "plant shop", width: 1280 }] },
    });
    expect(existsSync(join(root, "apps/plant-shop/src-tauri/target"))).toBe(
      false,
    );
    expect(read("apps/plant-shop/tsconfig.json")).toContain('"../../tooling/');
    expect(JSON.parse(read("tsconfig.json")).references).toEqual([
      { path: "./apps/docs" },
      { path: "./apps/plant-shop" },
    ]);
  });

  it("copies a template from apps/templates, renaming it and moving its paths to the root up a folder", () => {
    const made = createApp({
      root,
      name: "plant-shop",
      template: "dashboard",
      install: false,
      format: false,
    });
    expect(made).toEqual({
      folder: "apps/plant-shop",
      port: 5181,
      desktop: false,
    });
    expect(JSON.parse(read("apps/plant-shop/package.json")).name).toBe(
      "plant-shop",
    );
    expect(read("apps/plant-shop/index.html")).toContain(
      "<title>plant shop</title>",
    );
    expect(read("apps/plant-shop/src/App.tsx")).toBe(
      'const NAME = "plant shop";\n',
    );
    expect(read("apps/plant-shop/e2e/layout.spec.ts")).toContain(
      '"Workspace: plant shop"',
    );
    expect(read("apps/plant-shop/tsconfig.json")).toBe(
      '{ "extends": "../../tooling/tsconfig/app.json" }\n',
    );
    expect(existsSync(join(root, "apps/plant-shop/src-tauri"))).toBe(false);
  });

  it("says how to fix an unknown template, a name that isn't kebab-case and a folder that's taken", () => {
    expect(() =>
      createApp({
        root,
        name: "plant-shop",
        template: "blog",
        install: false,
        format: false,
      }),
    ).toThrow(
      'There\'s no template called "blog". Fix: pass --template with one of blank, dashboard, editor, marketing.',
    );
    expect(() =>
      createApp({ root, name: "Plant Shop", install: false, format: false }),
    ).toThrow(/Fix: give a kebab-case name/);
    expect(() =>
      createApp({ root, name: "starter", install: false, format: false }),
    ).toThrow("apps/starter already exists.");
  });

  it("finds each real template where it says it is, titled so a copy can take its name", () => {
    const repository = fileURLToPath(new URL("..", import.meta.url));
    for (const folder of Object.values(TEMPLATES)) {
      expect(
        readFileSync(join(repository, folder, "index.html"), "utf8"),
        folder,
      ).toMatch(/<title>[^<]+<\/title>/);
    }
  });
});
