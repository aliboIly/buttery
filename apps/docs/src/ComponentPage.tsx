import type { ReactElement } from "react";
import { Grid, Stack, Surface, Text } from "@buttery/core";
import { ExampleFrame } from "./ExampleFrame.tsx";
import type { Heading } from "./content.ts";
import type { ComponentEntry } from "./registry.ts";
import { slugify } from "./slug.ts";

function Facts({
  title,
  items,
}: {
  readonly title: string;
  readonly items: readonly string[];
}): ReactElement {
  return (
    <Surface level="card" pad={4}>
      <Stack gap={3}>
        <Text variant="title" asChild>
          <h2>{title}</h2>
        </Text>
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

/** A component's page: what it's for, its demos and its canonical examples. */
export function ComponentPage({
  entry,
}: {
  readonly entry: ComponentEntry;
}): ReactElement {
  const { meta, demos, frame, examples } = entry;
  const stage = frame === "page" ? "card" : "section";
  return (
    <Stack gap={12} asChild>
      <article>
        <Stack gap={6}>
          <Stack gap={4}>
            <Text variant="caption">{meta.kind}</Text>
            <Text variant="heading-1" asChild>
              <h1>{meta.name}</h1>
            </Text>
            <Text variant="body-lg">{meta.purpose}</Text>
          </Stack>
          <Grid columns={2} gap={4} className="pg-facts">
            <Facts title="Use it for" items={meta.useWhen} />
            <Facts title="Not for" items={meta.avoidWhen} />
          </Grid>
          <Text variant="body">
            <strong>Keyboard and screen readers:</strong> {meta.a11y}
          </Text>
        </Stack>
        {demos.map((demo) => (
          <Stack key={demo.title} gap={4} asChild>
            <section aria-label={demo.title}>
              <Stack gap={3}>
                <Text variant="title" asChild>
                  <h2 id={slugify(demo.title)}>{demo.title}</h2>
                </Text>
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
            <section aria-label="Examples">
              <Text variant="title" asChild>
                <h2 id="examples">Examples</h2>
              </Text>
              {examples.map((example) => (
                <ExampleFrame
                  key={example.name}
                  example={example}
                  frame={frame}
                  headingId={slugify(example.title)}
                />
              ))}
            </section>
          </Stack>
        ) : null}
      </article>
    </Stack>
  );
}
