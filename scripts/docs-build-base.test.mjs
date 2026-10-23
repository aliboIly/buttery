import {
  existsSync,
  globSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "@playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildDocs } from "./docs-build.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), "buttery-docs-base-"));
const out = join(scratch, "dist");
// The server build imports the app's packages, so it's written inside the app, where Node finds them.
const server = join(root, "apps/docs/dist-server-base-test");
const BASE = "/buttery/";
const SITE = "https://aliboily.github.io/buttery";

beforeAll(async () => {
  await buildDocs({ out, server, base: BASE, siteUrl: SITE });
}, 180_000);

afterAll(() => {
  rmSync(scratch, { recursive: true, force: true });
  rmSync(server, { recursive: true, force: true });
});

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

function decodeEntities(text) {
  return text
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

/**
 * Every `href` and `src` in a page's markup, but those inside a live example (`data-docs-example`), whose
 * links belong to the app the example stands for, such as a sidebar's `/orders`.
 */
function addressesIn(html) {
  const addresses = [];
  let depth = 0;
  for (const [, closing, name, attributes = ""] of html.matchAll(
    /<(\/?)([a-zA-Z][\w:-]*)((?:\s[^>]*)?)>/g,
  )) {
    const opens =
      closing === "" &&
      !VOID_ELEMENTS.has(name.toLowerCase()) &&
      !attributes.endsWith("/");
    if (depth > 0) {
      if (closing !== "") depth -= 1;
      else if (opens) depth += 1;
      continue;
    }
    if (closing === "" && /\sdata-docs-example(?:[\s=/]|$)/.test(attributes)) {
      if (opens) depth = 1;
      continue;
    }
    for (const [, value = ""] of attributes.matchAll(
      /\s(?:href|src)="([^"]*)"/g,
    ))
      addresses.push(decodeEntities(value));
  }
  return addresses;
}

function isInternal(address) {
  return !/^(?:https?:|mailto:|data:|#)/.test(address);
}

/** A roastery customer's page, which no file holds: 404.html draws it, as it does any address with no page. */
const CUSTOMER = /^\/buttery\/demos\/roastery\/customers\/[^/]+$/;

/** Whether an address under the base reaches something the build wrote: a file, or a folder's index.html. */
function reaches(address) {
  const path = decodeURIComponent(address.split(/[?#]/)[0] ?? "");
  if (!path.startsWith(BASE)) return false;
  if (CUSTOMER.test(path)) return true;
  const file = join(out, path.slice(BASE.length));
  return (
    (existsSync(file) && statSync(file).isFile()) ||
    existsSync(join(file, "index.html"))
  );
}

/** The links in Markdown, outside its code blocks, to a path on the site. */
function markdownLinks(markdown) {
  return [
    ...markdown
      .replace(/^```[\s\S]*?^```/gm, "")
      .matchAll(/\]\((\/[^)\s]*)\)/g),
  ].map(([, href]) => href ?? "");
}

describe("pnpm docs:build under a base", () => {
  it("puts every internal link and asset of every page under the base, each reaching a file it wrote", () => {
    const pages = globSync("**/*.html", { cwd: out });
    const problems = [];
    let checked = 0;
    for (const page of pages) {
      for (const address of addressesIn(
        readFileSync(join(out, page), "utf8"),
      )) {
        if (!isInternal(address)) continue;
        checked += 1;
        if (!address.startsWith(BASE))
          problems.push(`${page}: ${address} isn't under ${BASE}`);
        else if (!reaches(address))
          problems.push(`${page}: ${address} reaches no file`);
      }
    }
    expect(pages.length).toBeGreaterThan(150);
    expect(checked).toBeGreaterThan(10_000);
    expect(problems).toEqual([]);
  });

  it("links llms.txt and every page's Markdown under the base, each link reaching a file", () => {
    const llms = readFileSync(join(out, "llms.txt"), "utf8");
    expect(llms).toContain("(/buttery/components/button.md)");
    expect(llms).toContain("(/buttery/get-started/introduction.md)");
    const button = readFileSync(join(out, "components/button.md"), "utf8");
    expect(button).toContain(
      "[Button › Demo](/buttery/components/button#demo)",
    );
    expect(
      readFileSync(join(out, "foundations/palettes.md"), "utf8"),
    ).toContain("[color tokens](/buttery/foundations/colors)");
    const problems = [];
    for (const file of ["llms.txt", ...globSync("**/*.md", { cwd: out })]) {
      for (const href of markdownLinks(readFileSync(join(out, file), "utf8"))) {
        if (!href.startsWith(BASE) || !reaches(href))
          problems.push(`${file}: ${href}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("writes .nojekyll, and a 404.html whose assets are under the base, for GitHub Pages", () => {
    expect(existsSync(join(out, ".nojekyll"))).toBe(true);
    const notFound = readFileSync(join(out, "404.html"), "utf8");
    expect(notFound).toContain('<div id="root"></div>');
    expect(notFound).toMatch(
      /<script type="module"[^>]* src="\/buttery\/assets\//,
    );
  });

  it("writes the sitemap and canonical links from DOCS_URL's origin and the base", () => {
    const sitemap = readFileSync(join(out, "sitemap.xml"), "utf8");
    const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      ([, location]) => location ?? "",
    );
    expect(locations).toContain("https://aliboily.github.io/buttery/");
    expect(locations).toContain(
      "https://aliboily.github.io/buttery/components/button",
    );
    expect(
      locations.filter(
        (location) =>
          !location.startsWith("https://aliboily.github.io/buttery/"),
      ),
    ).toEqual([]);
    expect(readFileSync(join(out, "foundations/index.html"), "utf8")).toContain(
      '<link rel="canonical" href="https://aliboily.github.io/buttery/foundations/colors" />',
    );
  });

  it("builds nothing when DOCS_URL names a path the base doesn't serve, saying how to fix it", async () => {
    const elsewhere = join(scratch, "unbuilt");
    await expect(
      buildDocs({
        out: elsewhere,
        server,
        check: () => [],
        base: "/",
        siteUrl: SITE,
      }),
    ).rejects.toThrow(
      "DOCS_URL is https://aliboily.github.io/buttery, under /buttery/, but the site is built to be served from /. Fix: set BUTTERY_DOCS_BASE=/buttery/, or leave the path off DOCS_URL.",
    );
    expect(existsSync(elsewhere)).toBe(false);
  }, 120_000);
});

const TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
};

/**
 * Serves the build under the base as GitHub Pages serves a project site: a folder's address redirects to
 * its trailing slash and answers with the folder's index.html, and an address with no file answers 404
 * with the site's 404.html. Resolves to the server's origin and the way to close it.
 */
function servePages() {
  const host = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    const path = decodeURIComponent(url.pathname);
    const send = (file, status) => {
      response.writeHead(status, {
        "Content-Type": TYPES[extname(file)] ?? "application/octet-stream",
      });
      response.end(readFileSync(file));
    };
    if (`${path}/` === BASE) {
      response.writeHead(301, { Location: `${BASE}${url.search}` });
      response.end();
      return;
    }
    const file = resolve(out, `.${path.slice(BASE.length - 1)}`);
    if (!path.startsWith(BASE) || !file.startsWith(out)) {
      response.writeHead(404);
      response.end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) {
      if (!path.endsWith("/")) {
        response.writeHead(301, { Location: `${url.pathname}/${url.search}` });
        response.end();
        return;
      }
      if (existsSync(join(file, "index.html"))) {
        send(join(file, "index.html"), 200);
        return;
      }
    } else if (existsSync(file)) {
      send(file, 200);
      return;
    }
    send(join(out, "404.html"), 404);
  });
  return new Promise((done) => {
    host.listen(0, "127.0.0.1", () => {
      const address = host.address();
      done({
        origin: `http://127.0.0.1:${String(typeof address === "object" && address ? address.port : 0)}`,
        close: () =>
          new Promise((closed) => {
            host.close(closed);
          }),
      });
    });
  });
}

/** What a returning visitor has seen, so a demo opens without its first-visit announcement and nudge. */
const SEEN = {
  "buttery:announcement:roastery-roast-planning": "true",
  "buttery:nudge:roastery-delivery-questions": "true",
};

describe.each([
  ["Chromium", chromium],
  ["WebKit", webkit],
])(
  "the build under a base, served as GitHub Pages serves it, in %s",
  (_, engine) => {
    let site;
    let browser;

    beforeAll(async () => {
      site = await servePages();
      browser = await engine.launch();
    }, 60_000);

    afterAll(async () => {
      await browser?.close();
      await site?.close();
    });

    /**
     * A fresh page, and what it has logged so far: console errors, buttery's warnings, page errors and every
     * request to the site outside the base. The error a browser logs about a page that came with a 404, as
     * one drawn from 404.html does, is left out; a test checks that status on the page's response.
     */
    async function open() {
      const context = await browser.newContext({ baseURL: site.origin });
      await context.addInitScript((seen) => {
        for (const [key, value] of Object.entries(seen))
          localStorage.setItem(key, value);
      }, SEEN);
      const page = await context.newPage();
      const logged = [];
      const notFound = new Set();
      page.on("response", (response) => {
        if (
          response.request().isNavigationRequest() &&
          response.status() === 404
        )
          notFound.add(response.url());
      });
      page.on("console", (message) => {
        const text = message.text();
        if (message.type() === "error" || text.startsWith("[buttery:"))
          logged.push({ text, url: message.location().url });
      });
      page.on("pageerror", (error) => logged.push({ text: error.message }));
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (url.origin === site.origin && !url.pathname.startsWith(BASE))
          logged.push({ text: `requested ${url.pathname}, outside ${BASE}` });
      });
      const problems = () =>
        logged
          .filter(
            ({ text, url }) =>
              !(notFound.has(url) && text.includes("status of 404")),
          )
          .map(({ text }) => text);
      return { page, problems, close: () => context.close() };
    }

    async function heading(page, name) {
      await page
        .getByRole("heading", { level: 1, name, exact: true })
        .waitFor({ state: "visible" });
    }

    /** Marks the page's window, so a later check can tell a move within the page from a page load. */
    async function mark(page) {
      await page.evaluate(() => {
        globalThis.docsStayed = true;
      });
    }

    async function stayed(page) {
      return page.evaluate(() => globalThis.docsStayed === true);
    }

    it("opens the landing page, and a link on it opens its page within the page", async () => {
      const { page, problems, close } = await open();
      try {
        const response = await page.goto("/buttery/");
        expect(response?.status()).toBe(200);
        await heading(page, "Make anything buttery.");
        await mark(page);
        await page.getByRole("link", { name: "Browse components" }).click();
        await page.waitForURL(`${site.origin}/buttery/components/overview`);
        await heading(page, "All components");
        expect(await stayed(page)).toBe(true);
        expect(problems()).toEqual([]);
      } finally {
        await close();
      }
    }, 60_000);

    it("opens a component page at its folder's address, and a related component's page from it", async () => {
      const { page, problems, close } = await open();
      try {
        const response = await page.goto("/buttery/components/button");
        expect(response?.status()).toBe(200);
        expect(new URL(page.url()).pathname).toBe(
          "/buttery/components/button/",
        );
        await heading(page, "Button");
        await mark(page);
        await page
          .getByRole("region", { name: "Related to Button" })
          .getByRole("link", { name: "IconButton", exact: true })
          .click();
        await page.waitForURL(`${site.origin}/buttery/components/icon-button`);
        await heading(page, "IconButton");
        expect(await stayed(page)).toBe(true);
        expect(problems()).toEqual([]);
      } finally {
        await close();
      }
    }, 60_000);

    it("loads the search's index from under the base, and opens every result, then one, within the page", async () => {
      const { page, problems, close } = await open();
      try {
        await page.goto("/buttery/foundations/colors");
        await heading(page, "Colors");
        await mark(page);
        await page.getByRole("combobox", { name: "Search the docs" }).click();
        await page.keyboard.type("dialog");
        await page
          .locator('[data-bt-part="command-search-preview"]')
          .getByText('import { Dialog } from "@butteryui/react";')
          .waitFor({ state: "visible" });
        await page.keyboard.press("Enter");
        await page.waitForURL(`${site.origin}/buttery/search?q=dialog`);
        await page
          .getByRole("main")
          .locator('a[href="/buttery/components/dialog"]')
          .first()
          .click();
        await page.waitForURL(`${site.origin}/buttery/components/dialog`);
        await heading(page, "Dialog");
        expect(await stayed(page)).toBe(true);
        expect(problems()).toEqual([]);
      } finally {
        await close();
      }
    }, 60_000);

    it("opens a demo, moves between its pages, and draws a customer's page from 404.html on a reload", async () => {
      const { page, problems, close } = await open();
      try {
        const response = await page.goto("/buttery/demos/roastery");
        expect(response?.status()).toBe(200);
        await page
          .locator('[data-testid="roastery"] h1')
          .first()
          .waitFor({ state: "visible" });
        await mark(page);
        await page
          .getByRole("link", { name: "Customers", exact: true })
          .click();
        await page.waitForURL(
          `${site.origin}/buttery/demos/roastery/customers`,
        );
        await heading(page, "Customers");
        const customer = page
          .locator('[data-bt="DataTable"] [data-bt-part="data-table-link"]')
          .first();
        const name = (await customer.textContent()) ?? "";
        await customer.click();
        await page.waitForURL(
          new RegExp(`/buttery/demos/roastery/customers/[^/]+$`),
        );
        await heading(page, name);
        expect(await stayed(page)).toBe(true);
        expect(problems()).toEqual([]);
        const reloaded = await page.reload();
        expect(reloaded?.status()).toBe(404);
        await heading(page, name);
        expect(problems()).toEqual([]);
      } finally {
        await close();
      }
    }, 60_000);

    it("draws the not-found page for an address with no page under the base", async () => {
      const { page, problems, close } = await open();
      try {
        const response = await page.goto("/buttery/get-started/instalation");
        expect(response?.status()).toBe(404);
        await heading(page, "Page not found");
        expect(problems()).toEqual([]);
      } finally {
        await close();
      }
    }, 60_000);
  },
);
