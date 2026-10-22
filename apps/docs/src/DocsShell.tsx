import { useEffect, useRef } from "react";
import type { ReactElement, ReactNode } from "react";
import { Code } from "lucide-react";
import { Sticky, Text, useFloatingObstacle } from "@buttery/core";
import {
  ArrowLink,
  BrandMark,
  IconButton,
  MorphMenu,
  NavBar,
  Sidebar,
} from "@buttery/react";
import { DisplaySettings } from "./DisplaySettings.tsx";
import { DocsSearch } from "./search/DocsSearch.tsx";
import { OnThisPage } from "./OnThisPage.tsx";
import type { Heading } from "./content.ts";
import type { Settings } from "./location.ts";
import { COMPONENTS_OVERVIEW, groupHref } from "./nav.ts";
import { demoLinks, nav } from "./pages.tsx";
import { DOCS_VERSION, SOURCE_URL } from "./routes.ts";
import { ThemeToggle } from "./ThemeToggle.tsx";

/** Splits `items` into columns of at most `size`, so a long section reads as a grid in its menu. */
function columns<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

/**
 * The top bar's menus, each holding whole sections of the nav, so the site's ten sections fit the bar as
 * five menus, with a link at the foot of a menu whose section has a page about all of it; the sidebar still
 * lists every page.
 */
const TOP_MENUS: readonly {
  readonly label: string;
  readonly roots: readonly string[];
  readonly footer?: { readonly label: string; readonly href: string };
}[] = [
  { label: "Learn", roots: ["get-started", "foundations", "layout", "motion"] },
  {
    label: "Components",
    roots: ["components"],
    footer: { label: "Every component", href: `/${COMPONENTS_OVERVIEW}` },
  },
  { label: "Patterns", roots: ["patterns", "templates"] },
  { label: "Guides", roots: ["guides", "tools"] },
  { label: "Resources", roots: ["resources"] },
];

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
        skipTo="content"
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
        {TOP_MENUS.map((menu) => {
          const sections = menu.roots.flatMap(
            (root) => nav.find((section) => section.root === root) ?? [],
          );
          return (
            <MorphMenu.Item
              key={menu.label}
              label={menu.label}
              footer={
                menu.footer ? (
                  <ArrowLink href={menu.footer.href} arrow="forward">
                    {menu.footer.label}
                  </ArrowLink>
                ) : undefined
              }
            >
              {sections.flatMap((section) =>
                section.groups.length > 0
                  ? columns(section.groups, 4).map((column) => (
                      <MorphMenu.Column key={column[0]?.title}>
                        {column.map((group) => (
                          <MorphMenu.Entry
                            key={group.title}
                            href={groupHref(group.title)}
                            title={group.title}
                            caption={group.summary}
                          />
                        ))}
                      </MorphMenu.Column>
                    ))
                  : columns(section.pages, 10).map((column, at) => (
                      <MorphMenu.Column
                        key={column[0]?.route}
                        title={
                          sections.length > 1 && at === 0
                            ? section.title
                            : undefined
                        }
                      >
                        {column.map(({ route, page }) => (
                          <MorphMenu.Entry
                            key={route}
                            href={`/${route}`}
                            title={page.title}
                            aria-current={
                              route === current ? "page" : undefined
                            }
                          />
                        ))}
                      </MorphMenu.Column>
                    )),
              )}
            </MorphMenu.Item>
          );
        })}
      </NavBar>
      {wide ? (
        <main id="content" className="docs-wide">
          {children}
        </main>
      ) : (
        <div className="docs-body">
          <Sticky variant="aside" className="docs-sidebar bt-scroll-fade">
            <div ref={sidebar}>
              <PagesNav current={current} />
            </div>
          </Sticky>
          <main id="content" className="docs-main">
            {children}
          </main>
          <Sticky variant="aside" className="docs-aside">
            <OnThisPage headings={headings} />
          </Sticky>
        </div>
      )}
    </div>
  );
}
