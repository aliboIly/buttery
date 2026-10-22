import { createElement, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { Copy, Check } from "lucide-react";
import { Grid, Inline, Stack, Surface, Text } from "@buttery/core";
import type { DemoValues, Density, MotionClass } from "@buttery/core";
import {
  Breadcrumbs,
  Button,
  ButteryProvider,
  IconButton,
  SegmentedControl,
  StatusBadge,
  TagChip,
} from "@buttery/react";
import type { StatusTone } from "@buttery/react";
import { CodeText } from "./CodeBlock.tsx";
import { ExampleFrame } from "./ExampleFrame.tsx";
import { LiveControls, initialValues, jsxOf } from "./LiveControls.tsx";
import { PageFooter } from "./PageFooter.tsx";
import { TableScroll } from "./TableScroll.tsx";
import type { Neighbor } from "./PageFooter.tsx";
import { ExportDocs, PropsTables } from "./PropsTables.tsx";
import type { Heading } from "./content.ts";
import { rootOf } from "./nav.ts";
import { components } from "./registry.ts";
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

/** What each motion class does, in a sentence for a component's Motion part. */
const MOTION: Readonly<Record<MotionClass, string>> = {
  none: "It doesn't move.",
  press:
    "It scales to 97% while it's pressed, over `--bt-dur-press`, and springs back when it's let go.",
  hover:
    "It answers the pointer and keyboard focus within `--bt-dur-fast`, such as an arrow growing its stem, without changing size.",
  indicator:
    "Its selection indicator slides to the chosen option on `spring.snappy`, inside one track.",
  presence:
    "It appears with a `Presence` preset and leaves faster than it came, in about 60% of the time.",
  morph:
    "It changes shape as one surface, on `spring.smooth`, or `spring.morph` for a big change, rather than closing and reopening.",
  loop: "It cycles its states every few seconds and pauses while it's offscreen.",
  celebration:
    "It celebrates a real finish with one short burst, never a routine action.",
};

/** What each motion class does with reduced motion, unless a component's meta says more. */
const REDUCED: Readonly<Record<MotionClass, string>> = {
  none: "Nothing changes.",
  press: "It presses in at once, without easing.",
  hover: "The change happens at once.",
  indicator: "The indicator moves at once.",
  presence: "It fades in and out in 100ms, without moving.",
  morph: "It takes its new shape at once.",
  loop: "It stops on its first state.",
  celebration: "It doesn't celebrate.",
};

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

/** The package a component is imported from, by its folder. */
function packageOf(entry: ComponentEntry): string {
  return entry.folder.startsWith("packages/core/")
    ? "@buttery/core"
    : "@buttery/react";
}

/** Where a component's docs are: its own page, or its section on the written page that's its home. */
export function docsRouteOf(entry: ComponentEntry): string | undefined {
  const { page } = entry;
  if (!page) return undefined;
  return page.home === undefined
    ? `${rootOf(page.section)}/${entry.route}`
    : `${page.home}#${slugify(entry.meta.name)}`;
}

function ImportLine({
  entry,
}: {
  readonly entry: ComponentEntry;
}): ReactElement {
  const line = `import { ${entry.meta.name} } from "${packageOf(entry)}";`;
  const [copied, setCopied] = useState(false);
  return (
    <Inline gap={2} align="center" className="docs-import">
      <code className="docs-code">{line}</code>
      <IconButton
        icon={copied ? Check : Copy}
        label={copied ? "Copied" : "Copy the import"}
        size="sm"
        onClick={() => {
          void navigator.clipboard.writeText(line).then(() => {
            setCopied(true);
          });
        }}
      />
    </Inline>
  );
}

/**
 * The live demo: the component in a frame with its own theme and density, controls for its props, and the
 * code for what it shows.
 */
function LiveDemoFrame({
  entry,
}: {
  readonly entry: ComponentEntry;
}): ReactElement {
  const [scheme, setScheme] = useState<"light" | "dark">("light");
  const [density, setDensity] = useState<Density>("comfortable");
  const { live } = entry;
  const [values, setValues] = useState<DemoValues>(() =>
    live ? initialValues(live.controls) : {},
  );
  const [showing, setShowing] = useState(false);
  const [demo] = entry.demos;
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
          {live ? live.render(values) : demo ? demo.render() : null}
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
          <Inline gap={2}>
            <Button
              size="sm"
              variant="ghost"
              aria-expanded={showing}
              aria-label={`${showing ? "Hide" : "Show"} code for the ${entry.meta.name} demo`}
              onClick={() => {
                setShowing(!showing);
              }}
            >
              {showing ? "Hide code" : "Show code"}
            </Button>
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
                <Stack gap={2}>
                  <HeadingAt depth={inner} id={idFor(entry, depth, demo.title)}>
                    {demo.title}
                  </HeadingAt>
                  {demo.description === undefined ? null : (
                    <Text variant="body">{demo.description}</Text>
                  )}
                </Stack>
                <Surface level={stage} pad={6} radius="lg" className="pg-stage">
                  {demo.render()}
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
                    <tr key={row.keys}>
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
          <Text variant="body">{MOTION[meta.motion]}</Text>
          <Text variant="body">
            With reduced motion: {meta.reducedMotion ?? REDUCED[meta.motion]}
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
  /** Its section and group, each linking to its first page. */
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
          <ImportLine entry={entry} />
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
