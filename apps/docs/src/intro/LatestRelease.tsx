import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import { ArrowLink } from "@butteryui/react";
import { releases } from "virtual:buttery-whats-new";
import { markdown } from "../ContentPage.tsx";
import { Example } from "../Example.tsx";
import { withInlineCode } from "../inline-code.tsx";
import { siteHref } from "../location.ts";
import { minorOf, releaseId } from "../release.ts";

/**
 * The newest release under "New in" and its number: what it's for, the examples that show it, live, its
 * highlights, and links to its release notes and the roadmap.
 */
export function LatestRelease(): ReactElement | null {
  const release = releases[0];
  if (!release) return null;
  const Heading = markdown.h2;
  return (
    <Stack gap={5}>
      <Heading>{`New in ${minorOf(release.version)}`}</Heading>
      {release.summary === "" ? null : (
        <Text variant="body">{withInlineCode(release.summary)}</Text>
      )}
      {release.examples.map((reference) => {
        const [of = "", name = ""] = reference.split("/");
        return <Example key={reference} of={of} name={name} />;
      })}
      <Stack gap={3} asChild>
        <ul className="docs-list">
          {release.highlights.map((highlight) => (
            <Text key={highlight} variant="body" asChild>
              <li>{withInlineCode(highlight)}</li>
            </Text>
          ))}
        </ul>
      </Stack>
      <Inline gap={6} wrap>
        <ArrowLink
          href={siteHref(`/resources/whats-new#${releaseId(release.version)}`)}
        >
          {`Release notes for ${release.version}`}
        </ArrowLink>
        <ArrowLink href={siteHref("/resources/roadmap")}>
          What comes next
        </ArrowLink>
      </Inline>
    </Stack>
  );
}
