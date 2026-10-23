import { createElement } from "react";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setServerHref, siteHref, useSettings } from "./location.ts";

function Route(): ReactElement {
  return createElement("output", null, useSettings().route);
}

/** The route the router reads where the page renders for `href`, as the static build renders each page. */
function routeAt(href: string): string {
  setServerHref(href);
  return renderToString(createElement(Route)).replace(
    /^<output>|<\/output>$/g,
    "",
  );
}

afterEach(() => {
  vi.unstubAllEnvs();
  setServerHref("http://localhost/");
});

describe("the router", () => {
  it("reads the route from the whole path when the site is served from the root", () => {
    expect(routeAt("http://localhost/components/button")).toBe(
      "components/button",
    );
    expect(routeAt("http://localhost/")).toBe("");
  });

  it("reads the route from the path under the base a build serves the site from", () => {
    vi.stubEnv("BASE_URL", "/buttery/");
    expect(routeAt("http://localhost/buttery/components/button")).toBe(
      "components/button",
    );
    expect(
      routeAt("http://localhost/buttery/components/button/?theme=dark"),
    ).toBe("components/button");
    expect(routeAt("http://localhost/buttery/")).toBe("");
    expect(routeAt("http://localhost/buttery")).toBe("");
  });

  it("writes the site's addresses under the base", () => {
    expect(siteHref("/components/button")).toBe("/components/button");
    vi.stubEnv("BASE_URL", "/buttery/");
    expect(siteHref("/components/button")).toBe("/buttery/components/button");
    expect(siteHref("/")).toBe("/buttery/");
  });
});
