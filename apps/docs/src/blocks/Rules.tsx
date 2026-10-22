import type { ReactElement, ReactNode } from "react";
import { Grid, Stack, Surface, Text } from "@buttery/core";
import "./blocks.css";

/**
 * A numbered set of rules, such as the layout contract's thirteen, as cards two to a row where there's room,
 * each `<Rule>` numbered in order.
 */
export function Rules({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement {
  return (
    <Grid columns={{ base: 1, md: 2 }} gap={3} asChild>
      <ol role="list" className="docs-rules">
        {children}
      </ol>
    </Grid>
  );
}

/** One rule: its number, its name and a line or two of Markdown on what it asks. */
export function Rule({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <Surface level="section" pad={4} asChild>
      <li className="docs-rule">
        <span className="docs-rule-number" aria-hidden="true" />
        <Stack gap={2} className="docs-rule-body">
          <Text variant="title-sm" asChild>
            <p>{title}</p>
          </Text>
          {children}
        </Stack>
      </li>
    </Surface>
  );
}
