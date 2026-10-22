import type { ReactElement } from "react";
import { ExampleFrame } from "./ExampleFrame.tsx";
import { components } from "./registry.ts";
import { slugify } from "./slug.ts";

/**
 * A component's example on a written page, by the component's name and the example's file name:
 * `<Example of="Stack" name="spacing" />`. The docs check fails on one that doesn't exist.
 */
export function Example({
  of,
  name,
}: {
  readonly of: string;
  readonly name: string;
}): ReactElement {
  const entry = components.find(({ meta }) => meta.name === of);
  const example = entry?.examples.find((candidate) => candidate.name === name);
  if (!entry || !example) {
    throw new Error(
      `<Example of="${of}" name="${name}"> has no example to show. Fix: name a file in ${of}'s examples folder, without .tsx.`,
    );
  }
  return (
    <ExampleFrame
      example={example}
      frame={entry.frame}
      width={entry.width}
      headingId={slugify(`${of} ${example.title}`)}
    />
  );
}
