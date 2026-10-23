import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defaultClientConditions, defaultServerConditions } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    conditions: ["@butteryui/source", ...defaultClientConditions],
  },
  test: {
    projects: [
      {
        extends: true,
        // Tests in the apps import the packages by name; inlined, they resolve to the source, not a build.
        ssr: {
          resolve: {
            conditions: ["@butteryui/source", ...defaultServerConditions],
          },
        },
        test: {
          name: "node",
          environment: "node",
          server: { deps: { inline: [/^@butteryui\//] } },
          include: [
            "packages/*/src/**/*.test.ts",
            "apps/*/src/**/*.test.ts",
            "apps/templates/*/src/**/*.test.ts",
            "apps/demos/*/src/**/*.test.ts",
            "apps/*/vite/**/*.test.ts",
            "scripts/**/*.test.mjs",
          ],
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["packages/*/src/**/*.test.tsx"],
          // Files share one browser window, and focus can only be in one of their frames at a time.
          fileParallelism: false,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }, { browser: "webkit" }],
          },
        },
      },
    ],
  },
});
