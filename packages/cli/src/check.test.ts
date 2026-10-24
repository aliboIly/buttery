import { mkdtempSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FULL_MATRIX,
  QUICK_MATRIX,
  formatResult,
  printedUrl,
  runCheck,
  targetsFrom,
} from "./check.ts";

function app(manifest: object, title?: string): string {
  const root = mkdtempSync(join(tmpdir(), "buttery-check-"));
  writeFileSync(join(root, "package.json"), JSON.stringify(manifest));
  if (title !== undefined) {
    writeFileSync(
      join(root, "index.html"),
      `<!doctype html><title>${title}</title>`,
    );
  }
  return root;
}

const violation = {
  rule: "overflow",
  a: '[data-bt="SettingRow"]',
  px: 12,
  message: "content overflows its width by 12px",
  fix: "Give it room.",
  page: "/settings",
  density: "comfortable",
  engine: "chromium",
};

describe("buttery check", () => {
  it("checks the dev server's home page unless it's given pages", () => {
    expect(targetsFrom([])).toEqual([{ kind: "path", path: "" }]);
    expect(
      targetsFrom(["/settings", "http://localhost:4000/orders?page=2"]),
    ).toEqual([
      { kind: "path", path: "/settings" },
      { kind: "address", url: new URL("http://localhost:4000/orders?page=2") },
    ]);
  });

  it("says how to name a page when it's given something else", () => {
    for (const arg of ["settings", "localhost:5173", "file:///etc/hosts"]) {
      expect(() => targetsFrom([arg])).toThrow(
        /isn't a page\. Fix: pass a path on the dev server, such as \/settings/,
      );
    }
  });

  it("finds the address a dev server prints, in color or not", () => {
    expect(
      printedUrl(
        "\n  VITE v8.0.3  ready in 312 ms\n\n  ➜  Local:   http://localhost:5174/\n  ➜  Network: use --host to expose\n",
      )?.href,
    ).toBe("http://localhost:5174/");
    expect(
      printedUrl(
        "Local: \u001b[36mhttp://localhost:\u001b[1m5180\u001b[22m/app/\u001b[39m",
      )?.href,
    ).toBe("http://localhost:5180/app/");
    expect(printedUrl("- Local: http://127.0.0.1:3000")?.href).toBe(
      "http://127.0.0.1:3000/",
    );
    expect(printedUrl("Network: http://192.168.1.4:5173/")).toBeNull();
  });

  it("prints each problem once, with its fix and the conditions it showed in", () => {
    const result = {
      pages: ["/", "/settings"],
      violations: [
        { ...violation, viewport: "390x844", theme: "light" },
        { ...violation, viewport: "390x844", theme: "dark" },
      ],
    };
    expect(formatResult(result, QUICK_MATRIX)).toBe(
      [
        "Checked / and /settings at 390 and 1280, light and dark, comfortable, in chromium.",
        "",
        "✗ /settings",
        '  overflow      [data-bt="SettingRow"]: content overflows its width by 12px',
        "                Fix: Give it room.",
        "                In 390x844 light comfortable chromium and 390x844 dark comfortable chromium.",
        "",
        "buttery found 1 layout problem.",
      ].join("\n"),
    );
    expect(formatResult({ pages: ["/"], violations: [] }, FULL_MATRIX)).toBe(
      [
        "Checked / at 390, 768, 960, 1280, 1440 and 1728, light and dark, comfortable and compact, in chromium and webkit.",
        "",
        "buttery found no layout problems.",
      ].join("\n"),
    );
  });

  it("shows what the dev server printed when it stops before the app answers", async () => {
    const root = app({
      scripts: {
        dev: "node -e \"console.log('Port 5173 is in use'); process.exit(3)\"",
      },
    });
    const log: string[] = [];
    await expect(
      runCheck({
        root,
        targets: targetsFrom([]),
        matrix: QUICK_MATRIX,
        manager: "npm",
        log: (line) => log.push(line),
      }),
    ).rejects.toThrow(
      /npm run dev stopped \(exit code 3\) before the app answered\. It printed:[\s\S]*Port 5173 is in use[\s\S]*Fix: make npm run dev start the app/,
    );
    expect(log).toEqual(["Starting the app with npm run dev…"]);
  }, 30_000);

  it("won't check a different app that's answering on the app's port", async () => {
    const server = createServer((_request, response) => {
      response.end("<!doctype html><title>Someone else</title>");
    });
    await new Promise<void>((resolve) => {
      server.listen(0, "localhost", resolve);
    });
    try {
      const address = server.address();
      if (address === null || typeof address === "string") {
        throw new Error("The test server has no port.");
      }
      const { port } = address;
      const root = app(
        { config: { port }, scripts: { dev: "vite" } },
        "Plant shop",
      );
      await expect(
        runCheck({
          root,
          targets: targetsFrom(["/"]),
          matrix: QUICK_MATRIX,
          manager: "npm",
          log: () => undefined,
        }),
      ).rejects.toThrow(
        `Another app is running at http://localhost:${String(port)}/ ("Someone else", and this one is "Plant shop"). Fix: stop it, or give this app its own port`,
      );
    } finally {
      server.close();
    }
  });
});
