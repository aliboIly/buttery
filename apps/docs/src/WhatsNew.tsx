import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import { releases } from "virtual:buttery-whats-new";
import type { Release } from "virtual:buttery-whats-new";
import { withInlineCode } from "./inline-code.tsx";
import { releaseId } from "./release-id.ts";

/**
 * One release in a card: its version and date, its name, its highlights and, with `changes`, every change the
 * packages' changelogs list for it.
 */
export function ReleaseCard({
  release,
  heading,
  changes = false,
}: {
  readonly release: Release;
  /** The element its name is: `h2` on the What's new page, `h3` under a heading on the landing page. */
  readonly heading: "h2" | "h3";
  readonly changes?: boolean;
}): ReactElement {
  const Heading = heading;
  return (
    <Surface level="card" pad={6}>
      <Stack gap={3}>
        <Text variant="caption" tone="secondary">
          {`${release.version} · ${release.date}`}
        </Text>
        <Text variant="title" asChild>
          <Heading
            id={heading === "h2" ? releaseId(release.version) : undefined}
          >
            {release.title}
          </Heading>
        </Text>
        <Stack gap={2} asChild>
          <ul className="docs-list">
            {release.highlights.map((highlight) => (
              <Text key={highlight} variant="body" asChild>
                <li>{withInlineCode(highlight)}</li>
              </Text>
            ))}
          </ul>
        </Stack>
        {changes
          ? release.changes.map(({ packageName, lines }) => (
              <Stack key={packageName} gap={2}>
                <Text variant="title-sm">{packageName}</Text>
                <Stack gap={1} asChild>
                  <ul className="docs-list">
                    {lines.map((line) => (
                      <Text key={line} variant="body-sm" asChild>
                        <li>{withInlineCode(line)}</li>
                      </Text>
                    ))}
                  </ul>
                </Stack>
              </Stack>
            ))
          : null}
      </Stack>
    </Surface>
  );
}

/** Every release, newest first, each with its highlights and every change its packages' changelogs list. */
export function WhatsNew(): ReactElement {
  return (
    <Stack gap={4}>
      {releases.map((release) => (
        <ReleaseCard
          key={release.version}
          release={release}
          heading="h2"
          changes
        />
      ))}
    </Stack>
  );
}
