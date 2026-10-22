import type { ReactElement } from "react";
import { Stack, Text, useScrollSpy } from "@buttery/core";
import type { Heading } from "./content.ts";

/**
 * The current page's headings, the one being read marked as the page scrolls or jumps: the last heading
 * whose top has reached the bottom of the top bar, the last one once the page is scrolled to its end, and
 * the first above them all.
 */
export function OnThisPage({
  headings,
}: {
  readonly headings: readonly Heading[];
}): ReactElement | null {
  const spied = useScrollSpy(headings.map(({ id }) => id));
  const reading = spied ?? headings[0]?.id;

  if (headings.length === 0) return null;
  return (
    <nav aria-label="On this page" className="docs-toc">
      <Stack gap={2}>
        <Text variant="caption">On this page</Text>
        <Stack gap={1} asChild>
          <ul>
            {headings.map((heading) => (
              <li key={heading.id} data-depth={heading.depth}>
                <a
                  href={`#${heading.id}`}
                  className="docs-toc-link bt-focus"
                  aria-current={heading.id === reading ? "location" : undefined}
                >
                  <Text variant="body-sm" truncate>
                    {heading.text}
                  </Text>
                </a>
              </li>
            ))}
          </ul>
        </Stack>
      </Stack>
    </nav>
  );
}
