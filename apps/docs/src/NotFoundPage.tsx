import { useId } from "react";
import type { ReactElement } from "react";
import { Grid, Stack, Text } from "@buttery/core";
import { ArrowLink } from "@buttery/react";
import { siteHref } from "./location.ts";
import { DocsSearch } from "./search/DocsSearch.tsx";

/** A section of the site and the page it starts on. */
export interface SectionLink {
  readonly title: string;
  readonly href: string;
}

/** An address as it was typed, its escapes such as `%20` read back, or as it is when they don't read. */
function decoded(route: string): string {
  try {
    return decodeURIComponent(route);
  } catch {
    return route;
  }
}

/** The words at the end of an address, as a search for them: `get-started/date-picker.md` is "date picker". */
function wordsOf(address: string): string {
  return (address.split("/").at(-1) ?? "")
    .replace(/\.[a-z]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

/**
 * What an address with no page shows: that nothing is there, the docs search holding the address's last words,
 * and a link to each section.
 */
export function NotFoundPage({
  route,
  sections,
}: {
  readonly route: string;
  readonly sections: readonly SectionLink[];
}): ReactElement {
  const headingId = useId();
  const address = decoded(route);
  return (
    <Stack gap={8} asChild>
      <article className="docs-prose">
        <Stack gap={4}>
          <Text variant="heading-1" asChild>
            <h1>Page not found</h1>
          </Text>
          <Text variant="body-lg">
            No page lives at{" "}
            <code className="docs-code">{siteHref(`/${address}`)}</code>. Search
            for what you were after, or start from one of the sections.
          </Text>
        </Stack>
        <DocsSearch shortcut={false} defaultValue={wordsOf(address)} />
        <Stack gap={4} asChild>
          <section aria-labelledby={headingId}>
            <Text variant="heading-2" asChild>
              <h2 id={headingId}>Sections</h2>
            </Text>
            <Grid columns={{ base: 1, md: 2 }} gap={3}>
              {sections.map((section) => (
                <ArrowLink key={section.href} href={section.href}>
                  {section.title}
                </ArrowLink>
              ))}
            </Grid>
          </section>
        </Stack>
      </article>
    </Stack>
  );
}
