import { describe, expect, it } from "vitest";
import { docsBase, pathUnderBase, routeOf, sitePath } from "./base.ts";

describe("docsBase", () => {
  it("serves the site from the root when nothing sets a base", () => {
    expect(docsBase(undefined)).toBe("/");
    expect(docsBase("")).toBe("/");
    expect(docsBase("/")).toBe("/");
  });

  it("gives a base a slash at each end, however it's written", () => {
    expect(docsBase("buttery")).toBe("/buttery/");
    expect(docsBase("/buttery")).toBe("/buttery/");
    expect(docsBase("/buttery/")).toBe("/buttery/");
    expect(docsBase("//docs//buttery/")).toBe("/docs/buttery/");
  });

  it("refuses a value that isn't a path, saying how to fix it", () => {
    for (const value of [
      "./",
      "../buttery/",
      "https://aliboily.github.io/buttery",
      "/my docs/",
    ]) {
      expect(() => docsBase(value), value).toThrow(
        /BUTTERY_DOCS_BASE is ".*"\. Fix: set it to the path the site is served under, such as \/buttery\//,
      );
    }
  });
});

describe("sitePath", () => {
  it("leaves an address as it is at the root", () => {
    expect(sitePath("/components/button", "/")).toBe("/components/button");
    expect(sitePath("/", "/")).toBe("/");
  });

  it("puts an address under the base, its query and anchor with it", () => {
    expect(sitePath("/components/button", "/buttery/")).toBe(
      "/buttery/components/button",
    );
    expect(sitePath("/", "/buttery/")).toBe("/buttery/");
    expect(sitePath("/search?q=dialog", "/buttery/")).toBe(
      "/buttery/search?q=dialog",
    );
    expect(sitePath("/components/overview#actions", "/buttery/")).toBe(
      "/buttery/components/overview#actions",
    );
  });
});

describe("pathUnderBase", () => {
  it("gives an address's path from the site's root", () => {
    expect(pathUnderBase("/buttery/components/button", "/buttery/")).toBe(
      "/components/button",
    );
    expect(pathUnderBase("/buttery/", "/buttery/")).toBe("/");
    expect(pathUnderBase("/buttery", "/buttery/")).toBe("/");
    expect(pathUnderBase("/components/button", "/")).toBe("/components/button");
  });

  it("has no path for an address outside the base", () => {
    expect(pathUnderBase("/components/button", "/buttery/")).toBeNull();
    expect(pathUnderBase("/butteryish/components", "/buttery/")).toBeNull();
  });
});

describe("routeOf", () => {
  it("reads the route from the path under the base, without its slashes", () => {
    expect(routeOf("/buttery/components/button/", "/buttery/")).toBe(
      "components/button",
    );
    expect(routeOf("/buttery/", "/buttery/")).toBe("");
    expect(routeOf("/buttery", "/buttery/")).toBe("");
    expect(routeOf("/components/button", "/")).toBe("components/button");
  });

  it("reads an address outside the base as a route of its whole path, which has no page", () => {
    expect(routeOf("/orders", "/buttery/")).toBe("orders");
  });
});
