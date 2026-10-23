import { useState } from "react";
import type { ReactElement } from "react";
import {
  Grid,
  Icon,
  Inline,
  Morph,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@butteryui/core";
import { ArrowLink, TagChip } from "@butteryui/react";
import { ChevronDown, Link2 } from "lucide-react";
import { roadmap } from "virtual:buttery-roadmap";
import { releases } from "virtual:buttery-whats-new";
import type { Release } from "virtual:buttery-whats-new";
import { Example } from "./Example.tsx";
import { withInlineCode } from "./inline-code.tsx";
import { siteHref } from "./location.ts";
import { components, docsRouteOf } from "./registry.ts";
import { releaseDate, releaseId } from "./release.ts";
import { SOURCE_URL } from "./routes.ts";
import "./releases.css";

/** The tag beside a release's number: the release being built, or the newest one out. */
function stageOf(release: Release): "building" | "latest" | undefined {
  const stage = roadmap.releases.find(
    (candidate) => candidate.version === release.version,
  )?.stage;
  if (stage === "now") return "building";
  const latest = releases.find(
    (candidate) =>
      roadmap.releases.find((entry) => entry.version === candidate.version)
        ?.stage !== "now",
  );
  return latest?.version === release.version ? "latest" : undefined;
}

function StageTag({
  release,
}: {
  readonly release: Release;
}): ReactElement | null {
  switch (stageOf(release)) {
    case "building":
      return <TagChip tone="warning">In progress</TagChip>;
    case "latest":
      return <TagChip tone="info">Latest</TagChip>;
    case undefined:
      return null;
  }
}

/** A release's number as the release notes set it, in the code face. */
function VersionNumber({
  version,
}: {
  readonly version: string;
}): ReactElement {
  return <span className="docs-release-version">{version}</span>;
}

/**
 * One release in a card, for the landing page: its number, tag and date, its name, and its highlights.
 */
export function ReleaseCard({
  release,
  heading,
}: {
  readonly release: Release;
  /** The element its name is: `h3` under a heading on the landing page. */
  readonly heading: "h2" | "h3";
}): ReactElement {
  const Heading = heading;
  return (
    <Surface level="card" pad={6}>
      <Stack gap={3}>
        <Inline gap={2} align="center">
          <VersionNumber version={release.version} />
          <StageTag release={release} />
        </Inline>
        <Stack gap={2}>
          <Text variant="title" asChild>
            <Heading>{release.title}</Heading>
          </Text>
          <Text variant="caption" tone="secondary" asChild>
            <time dateTime={release.date}>{releaseDate(release.date)}</time>
          </Text>
        </Stack>
        <Stack gap={3} asChild>
          <ul className="docs-list">
            {release.highlights.map((highlight) => (
              <Text key={highlight} variant="body" asChild>
                <li>{withInlineCode(highlight)}</li>
              </Text>
            ))}
          </ul>
        </Stack>
      </Stack>
    </Surface>
  );
}

/** How many of a release's new components show before "Show all". */
const FIRST = 12;

/** The components a release brought, each linking to its page, the first dozen until "Show all" is pressed. */
function Arrivals({
  version,
}: {
  readonly version: string;
}): ReactElement | null {
  const [all, setAll] = useState(false);
  const arrived = components.flatMap((entry) => {
    const route = docsRouteOf(entry);
    return entry.page?.since === version && route !== undefined
      ? [{ name: entry.meta.name, route }]
      : [];
  });
  if (arrived.length === 0) return null;
  const shown = all ? arrived : arrived.slice(0, FIRST);
  return (
    <Stack gap={3}>
      <Text variant="title-sm" asChild>
        <h3>{`New components (${String(arrived.length)})`}</h3>
      </Text>
      <Morph contentKey={all ? "all" : "first"}>
        <Grid columns={{ base: 2, md: 3 }} gap={2} asChild>
          <ul role="list" className="docs-release-arrivals">
            {shown.map(({ name, route }) => (
              <li key={name}>
                <a href={siteHref(`/${route}`)} className="docs-link bt-focus">
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </Grid>
      </Morph>
      {arrived.length > FIRST ? (
        <Inline>
          <Pressable
            className="docs-disclosure"
            aria-expanded={all}
            onClick={() => {
              setAll(!all);
            }}
          >
            <Text variant="control">
              {all ? "Show fewer" : `Show all ${String(arrived.length)}`}
            </Text>
            <Icon icon={ChevronDown} data-open={all ? "" : undefined} />
          </Pressable>
        </Inline>
      ) : null}
    </Stack>
  );
}

/**
 * One release's notes on the timeline: its number and tag, its name as a heading that links to itself, its
 * date, what it's for, the examples that show it live, its highlights, the components it brought, and
 * every change its packages' changelogs list.
 */
function ReleaseNotes({
  release,
}: {
  readonly release: Release;
}): ReactElement {
  const id = releaseId(release.version);
  return (
    <article aria-labelledby={id} className="docs-release">
      <div className="docs-release-rail" aria-hidden="true">
        <span
          className="docs-release-dot"
          data-stage={stageOf(release) ?? "shipped"}
        />
        <span className="docs-release-line" />
      </div>
      <Stack gap={6} className="docs-release-body">
        <Stack gap={3}>
          <Inline gap={2} align="center">
            <VersionNumber version={release.version} />
            <StageTag release={release} />
          </Inline>
          <Text variant="heading-2" asChild>
            <h2 id={id}>
              <a href={`#${id}`} className="docs-anchor">
                {release.title}
                <span className="docs-anchor-icon">
                  <Icon icon={Link2} />
                </span>
              </a>
            </h2>
          </Text>
          <Inline gap={4} align="center" wrap>
            <Text variant="body-sm" tone="secondary" asChild>
              <time dateTime={release.date}>{releaseDate(release.date)}</time>
            </Text>
            {stageOf(release) === "building" ? null : (
              <ArrowLink
                href={`${SOURCE_URL}/releases/tag/v${release.version}`}
                arrow="external"
              >
                {`v${release.version} on GitHub`}
              </ArrowLink>
            )}
          </Inline>
        </Stack>
        {release.summary === "" ? null : (
          <Text variant="body-lg">{withInlineCode(release.summary)}</Text>
        )}
        {release.examples.map((reference) => {
          const [of = "", name = ""] = reference.split("/");
          return <Example key={reference} of={of} name={name} />;
        })}
        <Stack gap={3}>
          <Text variant="title-sm" asChild>
            <h3>Highlights</h3>
          </Text>
          <Stack gap={3} asChild>
            <ul className="docs-list">
              {release.highlights.map((highlight) => (
                <Text key={highlight} variant="body" asChild>
                  <li>{withInlineCode(highlight)}</li>
                </Text>
              ))}
            </ul>
          </Stack>
        </Stack>
        <Arrivals version={release.version} />
        {release.changes.map(({ packageName, lines }) => (
          <Stack key={packageName} gap={3}>
            <Text variant="title-sm" asChild>
              <h3>{`Changes in ${packageName}`}</h3>
            </Text>
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
        ))}
      </Stack>
    </article>
  );
}

/** Every release's notes on one timeline, newest first. */
export function WhatsNew(): ReactElement {
  return (
    <div className="docs-releases">
      {releases.map((release) => (
        <ReleaseNotes key={release.version} release={release} />
      ))}
    </div>
  );
}
