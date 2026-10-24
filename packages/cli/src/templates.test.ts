import { describe, expect, it } from "vitest";
import { appManifest, isTemplateName, withDesktop } from "./templates.ts";
import type { Versions } from "./templates.ts";

const versions: Versions = {
  buttery: "0.11.0",
  catalog: {
    react: "^19.3.1",
    vite: "^8.3.4",
    "@playwright/test": "^1.64.1",
    typescript: "6.0.3",
    "@tauri-apps/cli": "^2.12.3",
  },
  tools: {
    eslint: "^10.13.0",
    stylelint: "^17.16.0",
    "typescript-eslint": "^8.71.1",
  },
};

describe("appManifest", () => {
  it("swaps workspace and catalog versions for real ones and adds buttery's tools", () => {
    const manifest = appManifest(
      {
        name: "template-dashboard",
        exports: { ".": "./src/index.ts" },
        dependencies: { "@butteryui/react": "workspace:*", react: "catalog:" },
        devDependencies: { vite: "catalog:", "@tauri-apps/cli": "catalog:" },
      },
      versions,
    );
    expect(manifest["exports"]).toBeUndefined();
    expect(JSON.stringify(manifest["scripts"])).toContain("stylelint");
    expect(manifest["dependencies"]).toEqual({
      "@butteryui/react": "^0.11.0",
      react: "^19.3.1",
    });
    expect(manifest["devDependencies"]).toEqual({
      "@butteryui/cli": "^0.11.0",
      "@butteryui/lint": "^0.11.0",
      "@butteryui/mcp": "^0.11.0",
      "@butteryui/test": "^0.11.0",
      "@playwright/test": "^1.64.1",
      eslint: "^10.13.0",
      stylelint: "^17.16.0",
      typescript: "6.0.3",
      "typescript-eslint": "^8.71.1",
      vite: "^8.3.4",
    });
    expect(manifest["scripts"]).toMatchObject({
      check: "buttery check",
    });
  });

  it("says how to fix a catalog version that's missing", () => {
    expect(() =>
      appManifest({ dependencies: { motion: "catalog:" } }, versions),
    ).toThrow("Fix: add it to the catalog in pnpm-workspace.yaml.");
  });
});

describe("withDesktop", () => {
  it("adds the Tauri command line and its script", () => {
    const manifest = withDesktop(appManifest({}, versions), versions);
    expect(manifest["scripts"]).toMatchObject({ tauri: "tauri" });
    expect(manifest["devDependencies"]).toMatchObject({
      "@tauri-apps/cli": "^2.12.3",
    });
  });
});

describe("isTemplateName", () => {
  it("knows the four templates and nothing else", () => {
    expect(
      ["blank", "dashboard", "editor", "marketing"].every(isTemplateName),
    ).toBe(true);
    expect(isTemplateName("toString")).toBe(false);
  });
});
