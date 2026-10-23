#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { createServer as createSocket } from "node:net";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { createServer } from "vite";
import { demoPages } from "../apps/docs/src/routes.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = join(root, "apps/docs/public/previews");

/** The window each picture is taken at, drawn at three quarters of its size to keep the files small. */
const VIEWPORT = { width: 1280, height: 800 };
const SCALE = 0.75;

/** What a returning visitor has seen, so each demo is pictured at rest, without its first-visit tour or news. */
const SEEN = {
  "buttery:onboarding:deckhand": "done",
  "roastery:session": '"rosa@halfmoon.coffee"',
  "buttery:announcement:roastery-roast-planning": "true",
  "buttery:nudge:roastery-delivery-questions": "true",
};

function freePort() {
  return new Promise((resolve, reject) => {
    const socket = createSocket();
    socket.once("error", reject);
    socket.listen(0, () => {
      const address = socket.address();
      socket.close(() => {
        resolve(typeof address === "object" && address ? address.port : 0);
      });
    });
  });
}

/**
 * Takes a picture of each demo on its own dev server, in the light and dark themes, for the docs site's
 * demos page: `apps/docs/public/previews/<demo>-light.png` and `-dark.png`.
 */
export async function takePreviews() {
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const written = [];
  try {
    for (const { route } of demoPages) {
      const folder = join(root, "apps/demos", route);
      const port = await freePort();
      const server = await createServer({
        root: folder,
        configFile: join(folder, "vite.config.ts"),
        logLevel: "warn",
        server: { port, strictPort: true },
      });
      await server.listen();
      try {
        for (const scheme of ["light", "dark"]) {
          const page = await browser.newPage({
            viewport: VIEWPORT,
            deviceScaleFactor: SCALE,
            colorScheme: scheme,
            reducedMotion: "reduce",
          });
          await page.addInitScript((seen) => {
            for (const [key, value] of Object.entries(seen))
              localStorage.setItem(key, value);
          }, SEEN);
          await page.goto(`http://localhost:${String(port)}/`);
          await page.waitForFunction(() =>
            globalThis.document.documentElement.hasAttribute("data-bt-settled"),
          );
          await page.evaluate(() => globalThis.document.fonts.ready);
          await page.waitForTimeout(600);
          const file = join(out, `${route}-${scheme}.png`);
          await page.screenshot({ path: file });
          written.push(file);
          await page.close();
        }
      } finally {
        await server.close();
      }
    }
  } finally {
    await browser.close();
  }
  return written;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const written = await takePreviews();
  process.stdout.write(
    `Wrote ${String(written.length)} pictures to apps/docs/public/previews.\n`,
  );
}
