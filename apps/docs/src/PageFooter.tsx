import type { ReactElement } from "react";
import { lastChanged } from "virtual:buttery-dates";
import { Grid, Icon, Inline, Stack, Surface, Text } from "@buttery/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { siteHref } from "./location.ts";
import { SOURCE_URL } from "./routes.ts";

/** A page the footer links to: before or after this one in the nav. */
export interface Neighbor {
  readonly route: string;
  readonly title: string;
}

/** The page before or after this one, as a card that says which way it goes. */
function NeighborCard({
  neighbor,
  direction,
}: {
  readonly neighbor: Neighbor;
  readonly direction: "previous" | "next";
}): ReactElement {
  const way = direction === "previous" ? "Previous" : "Next";
  return (
    <Surface level="section" pad={4} radius="lg" asChild>
      <a
        href={siteHref(`/${neighbor.route}`)}
        className="docs-neighbor bt-focus"
        data-direction={direction}
      >
        <Text variant="caption" tone="secondary">
          {way}
        </Text>
        <Inline gap={1} align="center">
          {direction === "previous" ? <Icon icon={ChevronLeft} /> : null}
          <Text variant="title-sm">{neighbor.title}</Text>
          {direction === "next" ? <Icon icon={ChevronRight} /> : null}
        </Inline>
      </a>
    </Surface>
  );
}

/**
 * The end of a page: the pages before and after it in the nav as cards, a link to edit its source and when
 * that last changed.
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
        {previous || next ? (
          <Grid columns={{ base: 1, md: 2 }} gap={4}>
            {previous ? (
              <NeighborCard neighbor={previous} direction="previous" />
            ) : (
              <span />
            )}
            {next ? <NeighborCard neighbor={next} direction="next" /> : null}
          </Grid>
        ) : null}
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
