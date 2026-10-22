import type { ReactElement } from "react";
import { lastChanged } from "virtual:buttery-dates";
import { Inline, Stack, Text } from "@buttery/core";
import { ArrowLink } from "@buttery/react";
import { siteHref } from "./location.ts";
import { SOURCE_URL } from "./routes.ts";

/** A page the footer links to: before or after this one in the nav. */
export interface Neighbor {
  readonly route: string;
  readonly title: string;
}

/**
 * The end of a page: the pages before and after it in the nav, a link to edit its source and when that
 * last changed.
 */
export function PageFooter({
  previous,
  next,
  source,
}: {
  readonly previous: Neighbor | undefined;
  readonly next: Neighbor | undefined;
  /** The page's source file, from the repository's root. */
  readonly source: string;
}): ReactElement {
  const updated = lastChanged[source];
  return (
    <Stack gap={4} asChild>
      <footer className="docs-page-footer">
        <Inline gap={4} justify="between" wrap>
          {previous ? (
            <ArrowLink href={siteHref(`/${previous.route}`)} arrow="back">
              {previous.title}
            </ArrowLink>
          ) : (
            <span />
          )}
          {next ? (
            <ArrowLink href={siteHref(`/${next.route}`)}>
              {next.title}
            </ArrowLink>
          ) : null}
        </Inline>
        <Inline gap={3} wrap>
          <a
            href={`${SOURCE_URL}/edit/main/${source}`}
            className="docs-link bt-focus"
          >
            Edit this page
          </a>
          {updated === undefined ? null : (
            <Text variant="caption" tone="secondary">
              Last updated {updated}
            </Text>
          )}
        </Inline>
      </footer>
    </Stack>
  );
}
