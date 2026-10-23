import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@butteryui/core";
import type { ComponentEntry } from "./registry.ts";

/**
 * Every example of one component, each alone in its own frame, for the example checks: Playwright runs each
 * one's play and checks the page in light, dark and compact.
 */
export function LabExamples({
  entry,
}: {
  readonly entry: ComponentEntry;
}): ReactElement {
  return (
    <Stack gap={8}>
      <Text variant="heading-1" asChild>
        <h1>{`${entry.meta.name} examples`}</h1>
      </Text>
      {entry.examples.map(({ name, title, Component }) => (
        <Stack key={name} gap={3} asChild>
          <section aria-label={title} data-example={name}>
            <Text variant="title" asChild>
              <h2>{title}</h2>
            </Text>
            <Surface
              level={entry.frame === "page" ? "card" : "section"}
              pad={6}
              radius="lg"
              className="pg-stage"
              data-docs-example=""
            >
              <Component />
            </Surface>
          </section>
        </Stack>
      ))}
    </Stack>
  );
}
