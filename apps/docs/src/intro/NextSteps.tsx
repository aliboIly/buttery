import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import { ArrowLink } from "@butteryui/react";
import { contentPages } from "../content.ts";
import { siteHref } from "../location.ts";
import "./intro.css";

/** The pages of Get started after the one showing this, in the sidebar's order, as a numbered path. */
export function NextSteps({
  after = "get-started/introduction",
}: {
  /** The page the path starts after. Defaults to the Introduction. */
  readonly after?: string;
}): ReactElement {
  const steps = contentPages
    .filter(
      (entry) => entry.page.section === "get-started" && entry.route !== after,
    )
    .toSorted((a, b) => a.page.order - b.page.order);
  return (
    <ol role="list" className="docs-path">
      {steps.map((step, index) => (
        <li key={step.route} className="docs-path-step">
          <span className="docs-path-rail" aria-hidden="true">
            <Text variant="label" className="docs-path-number" tabular>
              {String(index + 1)}
            </Text>
            <span className="docs-path-line" />
          </span>
          <Stack gap={2} align="start" className="docs-path-body">
            <ArrowLink href={siteHref(`/${step.route}`)}>
              {step.page.title}
            </ArrowLink>
            <Text variant="body-sm" tone="secondary">
              {step.page.description}
            </Text>
          </Stack>
        </li>
      ))}
    </ol>
  );
}
