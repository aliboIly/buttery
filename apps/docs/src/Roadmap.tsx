import type { ReactElement, ReactNode } from "react";
import { Grid, Icon, Inline, Stack, Surface, Text } from "@buttery/core";
import { ArrowLink, Stat, StatStrip, TagChip } from "@buttery/react";
import { Circle, CircleCheck, Lightbulb, Link2 } from "lucide-react";
import { roadmap } from "virtual:buttery-roadmap";
import type { RoadmapRelease } from "virtual:buttery-roadmap";
import { releases } from "virtual:buttery-whats-new";
import { withInlineCode } from "./inline-code.tsx";
import { siteHref } from "./location.ts";
import { Progress } from "./Progress.tsx";
import { components } from "./registry.ts";
import { minorOf, releaseDate, releaseId } from "./release.ts";
import "./releases.css";

/** A part of the roadmap under a heading that links to itself, as the page's Markdown headings do. */
function Part({
  id,
  title,
  children,
}: {
  readonly id: string;
  readonly title: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <Stack gap={5} asChild>
      <section aria-labelledby={id}>
        <Text variant="heading-2" asChild>
          <h2 id={id} className="docs-h2">
            <a href={`#${id}`} className="docs-anchor">
              {title}
              <span className="docs-anchor-icon">
                <Icon icon={Link2} />
              </span>
            </a>
          </h2>
        </Text>
        {children}
      </section>
    </Stack>
  );
}

function doneOf(release: RoadmapRelease): number {
  return release.items.filter((item) => item.done).length;
}

/**
 * A release still to come, in a card: its number, where it stands and its phase, what it's for, how much of
 * it has landed, and each of its items, ticked or not.
 */
function UpcomingRelease({
  release,
}: {
  readonly release: RoadmapRelease;
}): ReactElement {
  const done = doneOf(release);
  const total = release.items.length;
  const count = `${String(done)} of ${String(total)} done`;
  return (
    <Surface level="card" pad={6}>
      <Stack gap={5}>
        <Inline gap={3} align="center" justify="between">
          <Inline gap={2} align="center">
            <span className="docs-release-version">{release.version}</span>
            {release.stage === "now" ? (
              <TagChip tone="warning">In progress</TagChip>
            ) : (
              <TagChip tone="neutral">Planned</TagChip>
            )}
          </Inline>
          {release.phase === "" ? null : (
            <Text variant="caption" tone="secondary">
              {release.phase}
            </Text>
          )}
        </Inline>
        <Stack gap={2}>
          <Text variant="title-lg" asChild>
            <h3>{release.title}</h3>
          </Text>
          {release.summary === "" ? null : (
            <Text variant="body" tone="secondary">
              {withInlineCode(release.summary)}
            </Text>
          )}
        </Stack>
        <Stack gap={2}>
          <Progress
            label={`${release.version} done so far`}
            value={done}
            max={total}
            valueText={count}
          />
          <Text variant="body-sm" tone="secondary" tabular>
            {count}
          </Text>
        </Stack>
        <Stack gap={3} asChild>
          <ul role="list" className="docs-roadmap-items">
            {release.items.map((item) => (
              <li key={item.text} data-done={item.done ? "" : undefined}>
                <Icon
                  icon={item.done ? CircleCheck : Circle}
                  label={item.done ? "Done" : "To do"}
                />
                <Text variant="body">{withInlineCode(item.text)}</Text>
              </li>
            ))}
          </ul>
        </Stack>
      </Stack>
    </Surface>
  );
}

/** A shipped release on the timeline: its number, name and date, what it was for, and a link to its notes. */
function ShippedRelease({
  release,
}: {
  readonly release: RoadmapRelease;
}): ReactElement {
  const notes = releases.find(
    (candidate) => candidate.version === release.version,
  );
  return (
    <li className="docs-release" data-compact="">
      <div className="docs-release-rail" aria-hidden="true">
        <span className="docs-release-dot" data-stage="shipped" />
        <span className="docs-release-line" />
      </div>
      <Stack gap={2} className="docs-release-body">
        <Inline gap={3} align="center">
          <span className="docs-release-version">{release.version}</span>
          {notes ? (
            <Text variant="caption" tone="secondary" asChild>
              <time dateTime={notes.date}>{releaseDate(notes.date)}</time>
            </Text>
          ) : null}
        </Inline>
        <Text variant="title" asChild>
          <h3>{notes?.title ?? release.title}</h3>
        </Text>
        {notes && notes.summary !== "" ? (
          <Text variant="body" tone="secondary">
            {withInlineCode(notes.summary)}
          </Text>
        ) : null}
        {notes ? (
          <Inline>
            <ArrowLink
              href={siteHref(
                `/resources/whats-new#${releaseId(release.version)}`,
              )}
            >
              {`Release notes for ${release.version}`}
            </ArrowLink>
          </Inline>
        ) : null}
      </Stack>
    </li>
  );
}

/**
 * The roadmap, read from `ROADMAP.md`: how far buttery has come, the release being built with every item
 * ticked or not, the releases planned after it, the ideas for later, and each shipped release.
 */
export function Roadmap(): ReactElement {
  const now = roadmap.releases.filter((release) => release.stage === "now");
  const planned = roadmap.releases.filter(
    (release) => release.stage === "planned",
  );
  const shipped = roadmap.releases
    .filter((release) => release.stage === "shipped")
    .reverse();
  const building = now[0];
  const documented = components.filter(
    (entry) =>
      entry.page !== undefined &&
      /^(?:components|patterns)\b/.test(entry.page.section),
  ).length;
  return (
    <Stack gap={8}>
      <StatStrip>
        <Stat value={shipped.length} label="releases shipped" />
        {building ? (
          <Stat
            value={doneOf(building)}
            suffix={` of ${String(building.items.length)}`}
            label={`done for ${minorOf(building.version)}`}
          />
        ) : null}
        <Stat value={documented} label="components and patterns" />
        <Stat value={roadmap.later.length} label="ideas for later" />
      </StatStrip>
      {now.length > 0 ? (
        <Part id="now" title="Now">
          {now.map((release) => (
            <UpcomingRelease key={release.version} release={release} />
          ))}
        </Part>
      ) : null}
      {planned.length > 0 ? (
        <Part id="next" title="Next">
          {planned.map((release) => (
            <UpcomingRelease key={release.version} release={release} />
          ))}
        </Part>
      ) : null}
      {roadmap.later.length > 0 ? (
        <Part id="later" title="Later">
          <Text variant="body" tone="secondary">
            Ideas for after that, not promises: each becomes a release on this
            page once it has a plan.
          </Text>
          <Grid columns={{ base: 1, md: 3 }} gap={4} asChild>
            <ul role="list" className="docs-roadmap-ideas">
              {roadmap.later.map((idea) => (
                <Surface key={idea.text} level="section" pad={5} asChild>
                  <li>
                    <Stack gap={3}>
                      <Icon icon={Lightbulb} />
                      <Text variant="body">{withInlineCode(idea.text)}</Text>
                    </Stack>
                  </li>
                </Surface>
              ))}
            </ul>
          </Grid>
        </Part>
      ) : null}
      {shipped.length > 0 ? (
        <Part id="shipped" title="Shipped">
          <ol role="list" className="docs-releases">
            {shipped.map((release) => (
              <ShippedRelease key={release.version} release={release} />
            ))}
          </ol>
        </Part>
      ) : null}
    </Stack>
  );
}
