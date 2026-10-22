#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import react from "@vitejs/plugin-react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer, defaultServerConditions } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const APPS = ["apps/docs", "apps/starter"];
const HERO = "docs/assets";

/** The mark's markup at each size, rendered by the component itself. */
async function markups(sizes) {
  const conditions = ["@buttery/source", ...defaultServerConditions];
  const server = await createServer({
    root,
    configFile: false,
    logLevel: "error",
    plugins: [react()],
    resolve: { conditions },
    ssr: { resolve: { conditions, externalConditions: conditions } },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  try {
    const { BrandMark } = await server.ssrLoadModule(
      "/packages/react/src/components/brand-mark/BrandMark.tsx",
    );
    return sizes.map((size) =>
      renderToStaticMarkup(createElement(BrandMark, { size })),
    );
  } finally {
    await server.close();
  }
}

const css = [
  "packages/core/src/tokens/tokens.css",
  "packages/react/src/components/brand-mark/brand-mark.css",
]
  .map((path) => readFileSync(join(root, path), "utf8"))
  .join("\n");

/** Inter, embedded, since a page set from a string can't load buttery's font files. */
const inter = readFileSync(
  join(
    root,
    "packages/core/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  ),
).toString("base64");
const font = `@font-face { font-family: "Inter Variable"; font-weight: 100 900; src: url(data:font/woff2;base64,${inter}) format("woff2"); }`;

/** Writes the computed colors onto the mark's elements, so the SVG stands alone without buttery's CSS. */
function standalone(svg) {
  // Painted and read back as sRGB hex, which every icon renderer reads; computed colors can be oklab().
  const canvas = globalThis.document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const hex = (color) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
    return `#${[red, green, blue].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
  };
  const ids = new Map();
  for (const [index, element] of [...svg.querySelectorAll("[id]")].entries()) {
    ids.set(element.id, `m${String(index)}`);
    element.id = `m${String(index)}`;
  }
  for (const element of svg.querySelectorAll("*")) {
    for (const name of ["fill", "stroke", "filter"]) {
      const value = element.getAttribute(name);
      const target = value && /^url\(#(.+)\)$/.exec(value)?.[1];
      if (target && ids.has(target))
        element.setAttribute(name, `url(#${ids.get(target)})`);
    }
    if (!element.hasAttribute("data-bt-part")) continue;
    const style = globalThis.getComputedStyle(element);
    if (element.localName === "stop") {
      element.setAttribute("stop-color", hex(style.stopColor));
    } else {
      if (!element.hasAttribute("fill"))
        element.setAttribute("fill", hex(style.fill));
      if (style.stroke !== "none" && !element.hasAttribute("stroke"))
        element.setAttribute("stroke", hex(style.stroke));
      if (style.opacity !== "1") element.setAttribute("opacity", style.opacity);
    }
    element.removeAttribute("data-bt-part");
  }
  for (const name of ["class", "data-bt", "data-size", "aria-hidden"])
    svg.removeAttribute(name);
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return new globalThis.XMLSerializer().serializeToString(svg);
}

/** An .ico holding PNG images, as every current browser and Windows read them. */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...pngs.map(({ data }) => data)]);
}

function write(path, data) {
  const full = join(root, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, data);
  process.stdout.write(`  ${path}\n`);
}

const [small, large] = await markups([16, 512]);
const browser = await chromium.launch();

async function shoot(svg, { size, scale, background = "transparent" }) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: scale,
  });
  await page.setContent(
    `<style>${css} html, body { margin: 0; background: ${background}; }</style>${svg}`,
  );
  const shot = await page.locator("svg").screenshot({ omitBackground: true });
  await page.close();
  return shot;
}

async function flattened(svg) {
  const page = await browser.newPage();
  await page.setContent(`<style>${css}</style>${svg}`);
  const text = await page.locator("svg").evaluate(standalone);
  await page.close();
  return `${text}\n`;
}

async function hero(theme) {
  const page = await browser.newPage({
    viewport: { width: 880, height: 280 },
    deviceScaleFactor: 2,
  });
  await page.setContent(`<!doctype html>
<html data-bt-theme="${theme}">
<style>
${font}
${css}
html, body { margin: 0; background: transparent; }
main { display: flex; align-items: center; justify-content: center; gap: 28px; block-size: 280px; font-family: var(--bt-font-sans); }
.bt-brand-mark { inline-size: 160px; block-size: 160px; }
h1 { margin: 0; font-size: 88px; font-weight: 650; letter-spacing: -0.04em; line-height: 1; color: var(--bt-text-strong); }
p { margin: 12px 0 0; font-size: 26px; color: var(--bt-text-secondary); letter-spacing: -0.01em; }
</style>
<main>${large}<div><h1>buttery</h1><p>Make anything buttery.</p></div></main>
</html>`);
  await page.evaluate(() => globalThis.document.fonts.ready);
  const shot = await page.locator("main").screenshot({ omitBackground: true });
  await page.close();
  return shot;
}

try {
  process.stdout.write("Writing the brand assets:\n");
  const favicon = await flattened(small);
  const icons = ico([
    { size: 16, data: await shoot(small, { size: 16, scale: 1 }) },
    { size: 32, data: await shoot(small, { size: 16, scale: 2 }) },
    { size: 48, data: await shoot(large, { size: 48, scale: 1 }) },
  ]);
  for (const app of APPS) {
    write(`${app}/public/favicon.svg`, favicon);
    write(`${app}/public/favicon.ico`, icons);
  }
  write(`${HERO}/buttery-light.png`, await hero("light"));
  write(`${HERO}/buttery-dark.png`, await hero("dark"));

  const scratch = mkdtempSync(join(tmpdir(), "buttery-icon-"));
  const source = join(scratch, "app-icon.png");
  writeFileSync(source, await shoot(large, { size: 512, scale: 2 }));
  execFileSync("pnpm", ["--filter", "starter", "tauri", "icon", source], {
    cwd: root,
    stdio: "ignore",
  });
  for (const platform of ["android", "ios"])
    rmSync(join(root, "apps/starter/src-tauri/icons", platform), {
      recursive: true,
      force: true,
    });
  rmSync(scratch, { recursive: true, force: true });
  process.stdout.write("  apps/starter/src-tauri/icons/\n");
} finally {
  await browser.close();
}
