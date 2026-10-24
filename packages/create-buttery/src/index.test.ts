import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const PACKAGE = fileURLToPath(new URL("../", import.meta.url));

beforeAll(() => {
  for (const name of ["cli", "create-buttery"]) {
    execFileSync("pnpm", ["run", "build"], {
      cwd: join(PACKAGE, "..", name),
      stdio: "ignore",
    });
  }
}, 120_000);

describe("create-buttery", () => {
  it("makes an app from a template, as buttery create does", () => {
    const cwd = mkdtempSync(join(tmpdir(), "create-buttery-"));
    const result = spawnSync(
      process.execPath,
      [
        join(PACKAGE, "dist/index.js"),
        "plant-shop",
        "--template",
        "dashboard",
        "--no-install",
      ],
      {
        cwd,
        encoding: "utf8",
        env: { ...process.env, npm_config_user_agent: "npm/11.6.0" },
      },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "Made plant-shop from the dashboard template.",
    );
    expect(result.stdout).toContain("npm install");
    const manifest: unknown = JSON.parse(
      readFileSync(join(cwd, "plant-shop/package.json"), "utf8"),
    );
    expect(manifest).toMatchObject({ name: "plant-shop" });
  });

  it("passes the command line's errors and exit code through", () => {
    const result = spawnSync(
      process.execPath,
      [join(PACKAGE, "dist/index.js"), "Plant Shop", "--no-install"],
      { cwd: mkdtempSync(join(tmpdir(), "create-buttery-")), encoding: "utf8" },
    );
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("can't name a package. Fix:");
  });
});
