import { createElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { Grid, Stack, Surface, Text } from "@buttery/core";
import { ExampleFrame } from "./ExampleFrame.tsx";
import type { Heading } from "./content.ts";
import type { ComponentEntry } from "./registry.ts";
import { slugify } from "./slug.ts";

/** How deep a component's sections start: `2` on its own page, `3` under a heading on a written page. */
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
  readonly depth: Depth;
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

/** The headings a component's page shows: its demos, then its examples. */
export function componentHeadings(entry: ComponentEntry): Heading[] {
  return [
    ...entry.demos.map(({ title }) => ({
      depth: 2 as const,
      text: title,
      id: slugify(title),
    })),
    ...(entry.examples.length > 0
      ? [
          { depth: 2 as const, text: "Examples", id: "examples" },
          ...entry.examples.map(({ title }) => ({
            depth: 3 as const,
            text: title,
            id: slugify(title),
          })),
        ]
      : []),
  ];
}

/**
 * What a component's docs hold, on its own page or under a heading on a written page: what it's for and
 * not for, how it works with a keyboard and a screen reader, its demos and its examples.
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
  return (
    <Stack gap={12}>
      <Stack gap={6}>
        <Grid columns={2} gap={4} className="pg-facts">
          <Facts title="Use it for" items={meta.useWhen} depth={depth} />
          <Facts title="Not for" items={meta.avoidWhen} depth={depth} />
        </Grid>
        <Text variant="body">
          <strong>Keyboard and screen readers:</strong> {meta.a11y}
        </Text>
      </Stack>
      {demos.map((demo) => (
        <Stack key={demo.title} gap={4} asChild>
          <section aria-label={demo.title}>
            <Stack gap={3}>
              <HeadingAt depth={depth} id={idFor(entry, depth, demo.title)}>
                {demo.title}
              </HeadingAt>
              {demo.description === undefined ? null : (
                <Text variant="body">{demo.description}</Text>
              )}
            </Stack>
            <Surface level={stage} pad={6} radius="lg" className="pg-stage">
              {demo.render()}
            </Surface>
          </section>
        </Stack>
      ))}
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
                headingId={idFor(entry, depth, example.title)}
                headingLevel={inner}
              />
            ))}
          </section>
        </Stack>
      ) : null}
    </Stack>
  );
}

/** A component's own page: its name, what it's for, then its docs. */
export function ComponentPage({
  entry,
}: {
  readonly entry: ComponentEntry;
}): ReactElement {
  const { meta } = entry;
  return (
    <Stack gap={12} asChild>
      <article>
        <Stack gap={4}>
          <Text variant="caption">{meta.kind}</Text>
          <Text variant="heading-1" asChild>
            <h1>{meta.name}</h1>
          </Text>
          <Text variant="body-lg">{meta.purpose}</Text>
        </Stack>
        <ComponentBody entry={entry} depth={2} />
      </article>
    </Stack>
  );
}
