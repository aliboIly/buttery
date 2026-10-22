import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { Heading } from "./content.ts";

/**
 * The current page's headings, the one being read marked as it scrolls past. It follows the last heading
 * whose top has passed the upper third of the window.
 */
export function OnThisPage({
  headings,
}: {
  readonly headings: readonly Heading[];
}): ReactElement | null {
  const [reading, setReading] = useState<string | undefined>(undefined);
  useEffect(() => {
    const targets = headings.flatMap(({ id }) => {
      const element = document.getElementById(id);
      return element ? [element] : [];
    });
    if (targets.length === 0) return undefined;
    const update = (): void => {
      const line = window.innerHeight / 3;
      let current = targets[0]?.id;
      for (const target of targets)
        if (target.getBoundingClientRect().top <= line) current = target.id;
      setReading(current);
    };
    const observer = new IntersectionObserver(update, {
      rootMargin: "0px 0px -66% 0px",
    });
    for (const target of targets) observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [headings]);

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
