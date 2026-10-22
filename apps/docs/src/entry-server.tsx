import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App.tsx";
import { setServerHref } from "./location.ts";
import { pageAt, pages } from "./pages.tsx";

/** One page as the static build writes it: its markup, and its title and description for the head. */
export interface PrerenderedPage {
  readonly route: string;
  readonly html: string;
  readonly title: string;
  readonly description: string;
}

/** Every route the static build writes: each page but the lab's, which only development serves. */
export function publicRoutes(): readonly string[] {
  return pages
    .filter((page) => page.route !== "lab" && !page.route.startsWith("lab/"))
    .map((page) => page.route);
}

/** The page at `route`, rendered to markup the way the site first draws it. */
export function render(route: string): PrerenderedPage {
  const page = pageAt(route);
  setServerHref(`http://localhost/${route}`);
  const html = renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  return {
    route,
    html,
    title: page.route === "" ? "buttery" : `${page.title} · buttery`,
    description: page.docs?.description ?? "Make anything buttery.",
  };
}
