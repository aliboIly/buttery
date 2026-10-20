import { existsSync, readdirSync, readFileSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

interface App {
  name: string;
  port: number;
}

function readApp(name: string): App {
  const manifest: unknown = JSON.parse(
    readFileSync(`apps/${name}/package.json`, "utf8"),
  );
  const port =
    typeof manifest === "object" &&
    manifest !== null &&
    "config" in manifest &&
    typeof manifest.config === "object" &&
    manifest.config !== null &&
    "port" in manifest.config
      ? manifest.config.port
      : undefined;
  if (typeof port !== "number") {
    throw new Error(`apps/${name}/package.json needs a numeric config.port.`);
  }
  return { name, port };
}

const apps = readdirSync("apps", { withFileTypes: true })
  .filter(
    (entry) => entry.isDirectory() && existsSync(`apps/${entry.name}/e2e`),
  )
  .map((entry) => readApp(entry.name));

const browsers = [
  { name: "chromium", device: devices["Desktop Chrome"] },
  { name: "webkit", device: devices["Desktop Safari"] },
] as const;

const ci = Boolean(process.env["CI"]);

export default defineConfig({
  forbidOnly: ci,
  reporter: ci ? "github" : "list",
  projects: apps.flatMap((app) =>
    browsers.map((browser) => ({
      name: `${app.name}-${browser.name}`,
      testDir: `apps/${app.name}/e2e`,
      use: {
        ...browser.device,
        baseURL: `http://localhost:${String(app.port)}`,
      },
    })),
  ),
  webServer: apps.map((app) => ({
    command: `pnpm --filter ${app.name} dev`,
    url: `http://localhost:${String(app.port)}`,
    reuseExistingServer: !ci,
  })),
});
