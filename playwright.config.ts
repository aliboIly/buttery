import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

interface App {
  /** Its package name, which `pnpm --filter` takes and its projects are named after. */
  name: string;
  dir: string;
  port: number;
}

function readApp(dir: string): App {
  const manifest: unknown = JSON.parse(
    readFileSync(join(dir, "package.json"), "utf8"),
  );
  const name =
    typeof manifest === "object" && manifest !== null && "name" in manifest
      ? manifest.name
      : undefined;
  const port =
    typeof manifest === "object" &&
    manifest !== null &&
    "config" in manifest &&
    typeof manifest.config === "object" &&
    manifest.config !== null &&
    "port" in manifest.config
      ? manifest.config.port
      : undefined;
  if (typeof name !== "string" || typeof port !== "number") {
    throw new Error(
      `${dir}/package.json needs a name and a numeric config.port.`,
    );
  }
  return { name, dir, port };
}

/** The folders apps live in: `apps/<name>`, and the templates and demos a level down. */
const APP_FOLDERS = ["apps", "apps/templates", "apps/demos"];

const apps = APP_FOLDERS.flatMap((folder) =>
  existsSync(folder)
    ? readdirSync(folder, { withFileTypes: true })
        .filter(
          (entry) =>
            entry.isDirectory() &&
            existsSync(join(folder, entry.name, "package.json")) &&
            existsSync(join(folder, entry.name, "e2e")),
        )
        .map((entry) => readApp(join(folder, entry.name)))
    : [],
);

const sharedPort = apps.find((app, index) =>
  apps.slice(0, index).some((other) => other.port === app.port),
);
if (sharedPort) {
  const sharing = apps
    .filter((app) => app.port === sharedPort.port)
    .map((app) => app.dir);
  throw new Error(
    `${sharing.join(" and ")} both have config.port ${String(sharedPort.port)}, so their test servers would collide. Fix: give each app its own port in its package.json, or move a folder that isn't one of this repository's apps out of apps/.`,
  );
}

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

/**
 * How far above each app's dev port its test server runs. Another checkout running its tests at the same time
 * sets `BUTTERY_E2E_PORT_OFFSET` to a free one, such as 2000.
 */
const portOffset = Number(process.env["BUTTERY_E2E_PORT_OFFSET"] ?? "1000");
if (!Number.isInteger(portOffset) || portOffset <= 0) {
  throw new Error(
    `BUTTERY_E2E_PORT_OFFSET is "${String(process.env["BUTTERY_E2E_PORT_OFFSET"])}". Fix: set it to a whole number of ports, such as 2000, or leave it unset.`,
  );
}

function testPort(app: App): number {
  return app.port + portOffset;
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
        testDir: `${app.dir}/e2e`,
        use: {
          ...browser.device,
          baseURL: `http://localhost:${String(testPort(app))}`,
          // Tests open the apps as a returning visitor, signed in to the roastery; the first-run tour and the
          // sign-in screen have their own tests that clear these.
          storageState: {
            cookies: [],
            origins: [
              {
                origin: `http://localhost:${String(testPort(app))}`,
                localStorage: [
                  { name: "buttery:onboarding:deckhand", value: "done" },
                  { name: "roastery:session", value: '"rosa@halfmoon.coffee"' },
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
