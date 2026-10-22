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

const packages = readdirSync("packages", { withFileTypes: true })
  .filter(
    (entry) => entry.isDirectory() && existsSync(`packages/${entry.name}/e2e`),
  )
  .map((entry) => entry.name);

const ci = Boolean(process.env["CI"]);

/**
 * The specs that time motion frame by frame, which a busy machine throws off: `BUTTERY_E2E=timing` runs only
 * them, two at a time, and `BUTTERY_E2E=rest` everything else, so `pnpm check` runs them on a quiet machine.
 */
const TIMING_SPECS = /(?:motion|arrow|toaster)\.spec\.ts$/;
const group = process.env["BUTTERY_E2E"];

function testPort(app: App): number {
  return app.port + 1000;
}

export default defineConfig({
  ...(group === "timing" ? { testMatch: TIMING_SPECS, workers: 2 } : {}),
  ...(group === "rest" ? { testIgnore: TIMING_SPECS } : {}),
  forbidOnly: ci,
  reporter: ci ? "github" : "list",
  projects: [
    ...apps.flatMap((app) =>
      browsers.map((browser) => ({
        name: `${app.name}-${browser.name}`,
        testDir: `apps/${app.name}/e2e`,
        use: {
          ...browser.device,
          baseURL: `http://localhost:${String(testPort(app))}`,
          // Tests open the apps as a returning visitor; the first-run tour has its own test that clears this.
          storageState: {
            cookies: [],
            origins: [
              {
                origin: `http://localhost:${String(testPort(app))}`,
                localStorage: [
                  { name: "buttery:onboarding:card-studio", value: "done" },
                ],
              },
            ],
          },
        },
      })),
    ),
    ...packages.flatMap((name) =>
      browsers.map((browser) => ({
        name: `${name}-${browser.name}`,
        testDir: `packages/${name}/e2e`,
        use: { ...browser.device },
      })),
    ),
  ],
  webServer: apps.map((app) => ({
    command: `pnpm --filter ${app.name} exec vite --port ${String(testPort(app))} --strictPort`,
    url: `http://localhost:${String(testPort(app))}`,
    reuseExistingServer: false,
  })),
});
