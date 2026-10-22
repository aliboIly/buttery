import { Fragment, createElement, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { Grid, Inline, Stack, Surface, Text } from "@buttery/core";
import type { ColorScheme, DemoValues, Density } from "@buttery/core";
import {
  Breadcrumbs,
  ButteryProvider,
  SegmentedControl,
  StatusBadge,
  TagChip,
  useButtery,
} from "@buttery/react";
import type { StatusTone } from "@buttery/react";
import { demoUses } from "virtual:buttery-demo-uses";
import { listed, screensByDemo } from "./demo-sentence.ts";
import { CodeText } from "./CodeBlock.tsx";
import { CodeToggle } from "./CodeToggle.tsx";
import { CopyLine } from "./CopyLine.tsx";
import { CopyPageMarkdown } from "./CopyPageMarkdown.tsx";
import { DesktopPreview } from "./DesktopPreview.tsx";
import { DemoHeading, ExampleFrame } from "./ExampleFrame.tsx";
import { LiveControls, initialValues, jsxOf } from "./LiveControls.tsx";
import { PageFooter } from "./PageFooter.tsx";
import { TableScroll } from "./TableScroll.tsx";
import type { Neighbor } from "./PageFooter.tsx";
import { ExportDocs, PropsTables } from "./PropsTables.tsx";
import type { Heading } from "./content.ts";
import { MOTION_TEXT, REDUCED_TEXT } from "./motion-text.ts";
import { rootOf } from "./nav.ts";
import { components, docsRouteOf, packageOf } from "./registry.ts";
import type { ComponentEntry } from "./registry.ts";
import { DOCS_VERSION } from "./routes.ts";
import { slugify } from "./slug.ts";

/** How deep a component's parts start: `2` on its own page, `3` under a heading on a written page. */
type Depth = 2 | 3;

function HeadingAt({
  depth,
  id,
  children,
}: {
  readonly depth: 2 | 3 | 4;
  readonly id?: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <Text variant={depth === 4 ? "label" : "title"} asChild>
      {createElement(`h${String(depth)}`, { id }, children)}
    </Text>
  );
}

function Facts({
  title,
  items,
  depth,
}: {
  readonly title: string;
  readonly items: readonly string[];
  readonly depth: 3 | 4;
}): ReactElement {
  return (
    <Surface level="card" pad={4}>
      <Stack gap={3}>
        <HeadingAt depth={depth}>{title}</HeadingAt>
        <Stack gap={2} asChild>
          <ul className="pg-list">
            {items.map((item) => (
              <Text key={item} variant="body" asChild>
                <li>{item}</li>
              </Text>
            ))}
          </ul>
        </Stack>
      </Stack>
    </Surface>
  );
}

/** A heading id that stays unique on a written page showing several components. */
function idFor(entry: ComponentEntry, depth: Depth, title: string): string {
  return depth === 2 ? slugify(title) : slugify(`${entry.meta.name} ${title}`);
}

const STATUS: Readonly<
  Record<
    "new" | "beta" | "stable" | "deprecated",
    readonly [StatusTone, string]
  >
> = {
  new: ["info", "New"],
  beta: ["warning", "Beta"],
  stable: ["success", "Stable"],
  deprecated: ["danger", "Deprecated"],
};

function minorOf(version: string): string {
  return version.split(".").slice(0, 2).join(".");
}

/** A demo in its stage, drawn at a desktop's width and scaled down to fit when its component is page-scale. */
function DemoDrawing({
  entry,
  children,
}: {
  readonly entry: ComponentEntry;
  readonly children: ReactNode;
}): ReactElement {
  return entry.width === "desktop" ? (
    <DesktopPreview>{children}</DesktopPreview>
  ) : (
    <>{children}</>
  );
}

/**
 * The live demo: the component in a frame that follows the site's theme and density until its own toggles
 * change them, controls for its props, and the code for what it shows.
 */
function LiveDemoFrame({
  entry,
}: {
  readonly entry: ComponentEntry;
}): ReactElement {
  const site = useButtery();
  const [schemeSet, setScheme] = useState<ColorScheme | null>(null);
  const [densitySet, setDensity] = useState<Density | null>(null);
  const scheme = schemeSet ?? site.colorScheme;
  const density = densitySet ?? site.density;
  const { live } = entry;
  const [values, setValues] = useState<DemoValues>(() =>
    live ? initialValues(live.controls) : {},
  );
  const [showing, setShowing] = useState(false);
  const stage = entry.frame === "page" ? "card" : "section";
  const code = live
    ? (live.code ?? ((current: DemoValues) => jsxOf(entry.meta.name, current)))(
        values,
      )
    : undefined;
  return (
    <Stack gap={3}>
      <Inline gap={2} wrap>
        <SegmentedControl
          label="Demo color scheme"
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
          value={scheme}
          onValueChange={setScheme}
        />
        <SegmentedControl
          label="Demo density"
          options={[
            { value: "comfortable", label: "Comfortable" },
            { value: "compact", label: "Compact" },
          ]}
          value={density}
          onValueChange={setDensity}
        />
      </Inline>
      <ButteryProvider colorScheme={scheme} density={density}>
        <Surface
          level={stage}
          pad={6}
          radius="lg"
          className="pg-stage"
          data-testid="live-demo"
        >
          {live ? (
            <DemoDrawing entry={entry}>{live.render(values)}</DemoDrawing>
          ) : null}
        </Surface>
      </ButteryProvider>
      {live ? (
        <LiveControls
          controls={live.controls}
          values={values}
          onChange={(name, value) => {
            setValues((current) => ({ ...current, [name]: value }));
          }}
        />
      ) : null}
      {code === undefined ? null : (
        <Stack gap={3}>
          <Inline>
            <CodeToggle
              open={showing}
              label={`the ${entry.meta.name} demo`}
              onToggle={() => {
                setShowing(!showing);
              }}
            />
          </Inline>
          {showing ? <CodeText code={code} /> : null}
        </Stack>
      )}
    </Stack>
  );
}

/**
 * The parts of a component's docs between its demo and its footer, on its own page or under a heading on
 * a written page: when to use it, its examples, its variants and states, its props, and its accessibility,
 * motion, layout and related components.
 */
export function ComponentBody({
  entry,
  depth,
}: {
  readonly entry: ComponentEntry;
  readonly depth: Depth;
}): ReactElement {
  const { meta, demos, frame, examples } = entry;
  const stage = frame === "page" ? "card" : "section";
  const inner = depth === 2 ? 3 : 4;
  const seenIn = entry.folder.includes("/primitives/")
    ? []
    : (demoUses[meta.name] ?? []);
  const related = meta.related.flatMap((name) => {
    const found = components.find((candidate) => candidate.meta.name === name);
    const route = found ? docsRouteOf(found) : undefined;
    return route === undefined ? [] : [{ name, route }];
  });
  return (
    <Stack gap={12}>
      <Stack gap={4} asChild>
        <section aria-label={`When to use ${meta.name}`}>
          <HeadingAt depth={depth} id={idFor(entry, depth, "When to use it")}>
            When to use it
          </HeadingAt>
          <Grid columns={2} gap={4} className="pg-facts">
            <Facts title="Use it for" items={meta.useWhen} depth={inner} />
            <Facts title="Not for" items={meta.avoidWhen} depth={inner} />
          </Grid>
        </section>
      </Stack>
      {examples.length > 0 ? (
        <Stack gap={4} asChild>
          <section aria-label={`${meta.name} examples`}>
            <HeadingAt depth={depth} id={idFor(entry, depth, "Examples")}>
              Examples
            </HeadingAt>
            {examples.map((example) => (
              <ExampleFrame
                key={example.name}
                example={example}
                frame={frame}
                width={entry.width}
                headingId={idFor(entry, depth, `${example.title} example`)}
                headingLevel={inner}
              />
            ))}
          </section>
        </Stack>
      ) : null}
      {demos.length > 0 ? (
        <Stack gap={6} asChild>
          <section aria-label={`${meta.name} variants and states`}>
            <HeadingAt
              depth={depth}
              id={idFor(entry, depth, "Variants and states")}
            >
              Variants and states
            </HeadingAt>
            {demos.map((demo) => (
              <Stack key={demo.title} gap={3}>
                <DemoHeading
                  title={demo.title}
                  caption={demo.description}
                  level={inner}
                  id={idFor(entry, depth, demo.title)}
                />
                <Surface level={stage} pad={6} radius="lg" className="pg-stage">
                  <DemoDrawing entry={entry}>{demo.render()}</DemoDrawing>
                </Surface>
              </Stack>
            ))}
          </section>
        </Stack>
      ) : null}
      <Stack gap={4} asChild>
        <section aria-label={`${meta.name} props`}>
          <HeadingAt depth={depth} id={idFor(entry, depth, "Props")}>
            Props
          </HeadingAt>
          <PropsTables name={meta.name} headingLevel={inner} />
          <ExportDocs name={meta.name} headingLevel={inner} />
        </section>
      </Stack>
      <Stack gap={4} asChild>
        <section aria-label={`${meta.name} accessibility`}>
          <HeadingAt depth={depth} id={idFor(entry, depth, "Accessibility")}>
            Accessibility
          </HeadingAt>
          <Text variant="body">{meta.a11y}</Text>
          {meta.keyboard === undefined ? null : meta.keyboard.length === 0 ? (
            <Text variant="body">It takes no keyboard input of its own.</Text>
          ) : (
            <TableScroll label={`${meta.name} keyboard`}>
              <table className="tk-table">
                <thead>
                  <tr>
                    <th scope="col">Keys</th>
                    <th scope="col">What they do</th>
                  </tr>
                </thead>
                <tbody>
                  {meta.keyboard.map((row) => (
                    <tr key={`${row.keys}: ${row.does}`}>
                      <td>
                        <kbd className="docs-kbd">{row.keys}</kbd>
                      </td>
                      <td>{row.does}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
          )}
        </section>
      </Stack>
      <Stack gap={4} asChild>
        <section aria-label={`${meta.name} motion`}>
          <HeadingAt depth={depth} id={idFor(entry, depth, "Motion")}>
            Motion
          </HeadingAt>
          <Text variant="body">{MOTION_TEXT[meta.motion]}</Text>
          <Text variant="body">
            With reduced motion:{" "}
            {meta.reducedMotion ?? REDUCED_TEXT[meta.motion]}
          </Text>
        </section>
      </Stack>
      {meta.layout === undefined ? null : (
        <Stack gap={4} asChild>
          <section aria-label={`${meta.name} layout`}>
            <HeadingAt depth={depth} id={idFor(entry, depth, "Layout")}>
              Layout
            </HeadingAt>
            <Text variant="body">{meta.layout}</Text>
          </section>
        </Stack>
      )}
      {related.length > 0 ? (
        <Stack gap={4} asChild>
          <section aria-label={`Related to ${meta.name}`}>
            <HeadingAt depth={depth} id={idFor(entry, depth, "Related")}>
              Related
            </HeadingAt>
            <Inline gap={4} wrap className="docs-related">
              {related.map(({ name, route }) => (
                <a key={name} href={`/${route}`} className="docs-link bt-focus">
                  {name}
                </a>
              ))}
            </Inline>
            {seenIn.length > 0 ? (
              <Text variant="body" tone="secondary">
                {screensByDemo(seenIn).map((group, at) => (
                  <Fragment key={group.demo}>
                    {at > 0 ? " " : null}
                    {"See it in "}
                    {group.screens.map((screen, index) =>
                      screen.page === undefined ? (
                        <a
                          key={screen.href}
                          href={screen.href}
                          className="docs-link bt-focus"
                        >
                          {screen.demo}
                        </a>
                      ) : (
                        <Fragment key={screen.page}>
                          {index === 0
                            ? `${group.demo}'s `
                            : listed(group.screens, index)}
                          <a href={screen.href} className="docs-link bt-focus">
                            {screen.page}
                          </a>
                        </Fragment>
                      ),
                    )}
                    .
                  </Fragment>
                ))}
              </Text>
            ) : null}
          </section>
        </Stack>
      ) : null}
    </Stack>
  );
}

/** The headings a component's page shows, for its "On this page" list. */
export function componentHeadings(entry: ComponentEntry): Heading[] {
  const part = (text: string): Heading => ({
    depth: 2,
    text,
    id: slugify(text),
  });
  const titled = (text: string): Heading => ({
    depth: 3,
    text,
    id: slugify(text),
  });
  return [
    part("Demo"),
    part("When to use it"),
    ...(entry.examples.length > 0
      ? [
          part("Examples"),
          ...entry.examples.map(({ title }) => ({
            ...titled(title),
            id: slugify(`${title} example`),
          })),
        ]
      : []),
    ...(entry.demos.length > 0
      ? [
          part("Variants and states"),
          ...entry.demos.map(({ title }) => titled(title)),
        ]
      : []),
    part("Props"),
    part("Accessibility"),
    part("Motion"),
    ...(entry.meta.layout === undefined ? [] : [part("Layout")]),
    ...(entry.meta.related.length > 0 ? [part("Related")] : []),
  ];
}

/** A component's own page: its breadcrumbs, name and badges, its live demo, its docs and its footer. */
export function ComponentPage({
  entry,
  crumbs,
  previous,
  next,
}: {
  readonly entry: ComponentEntry;
  /** Its section, linking to the section's first page, and its group, linking to its part of the overview. */
  readonly crumbs: readonly { readonly label: string; readonly href: string }[];
  readonly previous: Neighbor | undefined;
  readonly next: Neighbor | undefined;
}): ReactElement {
  const { meta, page } = entry;
  const [tone, status] = STATUS[page?.status ?? "stable"];
  const isNew =
    page !== undefined &&
    page.status !== "new" &&
    minorOf(page.since) === minorOf(DOCS_VERSION);
  return (
    <Stack gap={12} asChild>
      <article>
        <Stack gap={4}>
          {crumbs.length > 0 ? <Breadcrumbs items={crumbs} /> : null}
          <Text variant="heading-1" asChild>
            <h1 id={slugify(meta.name)}>{meta.name}</h1>
          </Text>
          <Text variant="body-lg">{page?.description ?? meta.purpose}</Text>
          <Inline gap={2} align="center" wrap>
            <StatusBadge tone={tone}>{status}</StatusBadge>
            {isNew ? (
              <TagChip tone="info">{`New in ${minorOf(DOCS_VERSION)}`}</TagChip>
            ) : null}
            {page ? (
              <Text
                variant="caption"
                tone="secondary"
              >{`Since ${page.since}`}</Text>
            ) : null}
          </Inline>
          <Inline gap={2} align="center" wrap>
            <CopyLine
              text={`import { ${entry.meta.name} } from "${packageOf(entry)}";`}
              label="Copy the import"
            />
            <CopyPageMarkdown
              route={
                page ? `${rootOf(page.section)}/${entry.route}` : entry.route
              }
            />
          </Inline>
        </Stack>
        <Stack gap={4} asChild>
          <section aria-label={`${meta.name} demo`}>
            <HeadingAt depth={2} id="demo">
              Demo
            </HeadingAt>
            <LiveDemoFrame entry={entry} />
          </section>
        </Stack>
        <ComponentBody entry={entry} depth={2} />
        <PageFooter
          previous={previous}
          next={next}
          source={`${entry.folder}/${meta.name}.playground.tsx`}
        />
      </article>
    </Stack>
  );
}
