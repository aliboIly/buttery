import { useEffect, useRef } from "react";
import type { ReactElement, ReactNode } from "react";
import { Code, Moon, Sun } from "lucide-react";
import { Sticky, Text, useFloatingObstacle } from "@buttery/core";
import {
  BrandMark,
  IconButton,
  MorphMenu,
  NavBar,
  Sidebar,
  useButtery,
} from "@buttery/react";
import { DisplaySettings } from "./DisplaySettings.tsx";
import { DocsSearch } from "./search/DocsSearch.tsx";
import { OnThisPage } from "./OnThisPage.tsx";
import type { Heading } from "./content.ts";
import { setSetting } from "./location.ts";
import type { Settings } from "./location.ts";
import { demoLinks, nav } from "./pages.tsx";
import { DOCS_VERSION, SOURCE_URL } from "./routes.ts";

/** Splits `items` into columns of at most `size`, so a long section reads as a grid in its menu. */
function columns<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

function ThemeToggle(): ReactElement {
  const dark = useButtery().colorScheme === "dark";
  return (
    <IconButton
      icon={dark ? Sun : Moon}
      label={dark ? "Use the light theme" : "Use the dark theme"}
      onClick={() => {
        setSetting("theme", dark ? "light" : "dark");
      }}
    />
  );
}

/** Every page of the site in its sections, the current one marked, for the sidebar. */
function PagesNav({ current }: { readonly current: string }): ReactElement {
  return (
    <Sidebar label="Pages">
      {nav.map((section) => (
        <Sidebar.Section key={section.root} title={section.title}>
          {section.pages.map(({ route, page }) => (
            <Sidebar.Item
              key={route}
              label={page.title}
              href={`/${route}`}
              current={route === current}
            />
          ))}
          {section.groups.map((group) => (
            <Sidebar.Group
              key={group.title}
              label={group.title}
              defaultOpen={group.pages.some(({ route }) => route === current)}
            >
              {group.pages.map(({ route, page }) => (
                <Sidebar.Item
                  key={route}
                  label={page.title}
                  href={`/${route}`}
                  current={route === current}
                />
              ))}
            </Sidebar.Group>
          ))}
        </Sidebar.Section>
      ))}
      <Sidebar.Section title="Demos">
        {demoLinks.map(({ route, title }) => (
          <Sidebar.Item
            key={route}
            label={title}
            href={`/${route}`}
            current={route === current}
          />
        ))}
      </Sidebar.Section>
    </Sidebar>
  );
}

interface DocsShellProps {
  readonly current: string;
  readonly settings: Settings;
  readonly headings: readonly Heading[];
  /** Whether the page takes the shell's whole width, without the sidebar and its headings, as the landing page does. */
  readonly wide?: boolean;
  readonly children: ReactNode;
}

/**
 * The docs site's shell: the top bar with the mark, the sections, the version and the display settings;
 * every page in the sidebar; the page; and its headings on the right while there's room. A `wide` page
 * takes the whole width under the bar.
 */
export function DocsShell({
  current,
  settings,
  headings,
  wide = false,
  children,
}: DocsShellProps): ReactElement {
  const obstacle = useFloatingObstacle();
  const sidebar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sidebar.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [current]);

  return (
    <div className="docs-shell">
      <NavBar
        ref={obstacle}
        behavior="sticky"
        contained={false}
        label="Docs"
        className="docs-top"
        brand={
          <a href="/">
            <BrandMark size={24} />
            buttery
          </a>
        }
        search={<DocsSearch />}
        actions={
          <>
            <Text variant="caption" tone="secondary" className="docs-version">
              {`v${DOCS_VERSION}`}
            </Text>
            <ThemeToggle />
            <DisplaySettings settings={settings} />
            <IconButton icon={Code} label="Source on GitHub" asChild>
              <a href={SOURCE_URL} aria-label="Source on GitHub" />
            </IconButton>
          </>
        }
      >
        {nav.map((section) => {
          const pages = [
            ...section.pages,
            ...section.groups.flatMap((group) => group.pages),
          ];
          return (
            <MorphMenu.Item key={section.root} label={section.title}>
              {columns(pages, 8).map((column) => (
                <MorphMenu.Column key={column[0]?.route}>
                  {column.map(({ route, page }) => (
                    <MorphMenu.Entry
                      key={route}
                      href={`/${route}`}
                      title={page.title}
                      aria-current={route === current ? "page" : undefined}
                    />
                  ))}
                </MorphMenu.Column>
              ))}
            </MorphMenu.Item>
          );
        })}
      </NavBar>
      {wide ? (
        <main className="docs-wide">{children}</main>
      ) : (
        <div className="docs-body">
          <Sticky variant="aside" className="docs-sidebar bt-scroll-fade">
            <div ref={sidebar}>
              <PagesNav current={current} />
            </div>
          </Sticky>
          <main className="docs-main">{children}</main>
          <Sticky variant="aside" className="docs-aside">
            <OnThisPage headings={headings} />
          </Sticky>
        </div>
      )}
    </div>
  );
}
