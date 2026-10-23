import { useId } from "react";
import type { ReactElement } from "react";
import { Grid, Inline, Stack, Surface, Text } from "@buttery/core";
import { Button, useButtery } from "@buttery/react";
import { CopyLine } from "../CopyLine.tsx";
import { siteHref } from "../location.ts";
import { components, docsRouteOf } from "../registry.ts";
import { SOURCE_URL, demoPages } from "../routes.ts";
import type { DemoInfo } from "../routes.ts";

/** The components and patterns in `names`, each linking to where its docs are. */
export function ComponentLinks({
  names,
}: {
  readonly names: readonly string[];
}): ReactElement {
  return (
    <Inline gap={4} wrap className="docs-related">
      {names.map((name) => {
        const entry = components.find(({ meta }) => meta.name === name);
        const route = entry ? docsRouteOf(entry) : undefined;
        return route === undefined ? (
          <Text key={name} variant="body">
            {name}
          </Text>
        ) : (
          <a
            key={name}
            href={siteHref(`/${route}`)}
            className="docs-link bt-focus"
          >
            {name}
          </a>
        );
      })}
    </Inline>
  );
}

function DemoCard({
  demo,
  dark,
}: {
  readonly demo: DemoInfo;
  readonly dark: boolean;
}): ReactElement {
  const titleId = useId();
  return (
    <Surface level="card" pad={5} asChild>
      <Stack gap={6} asChild>
        <section aria-labelledby={titleId}>
          <Grid columns={{ base: 1, md: 2 }} gap={5} align="start">
            <img
              className="docs-demo-preview"
              src={siteHref(
                `/previews/${demo.route}-${dark ? "dark" : "light"}.png`,
              )}
              alt={`${demo.title} as it opens`}
              width={960}
              height={600}
              loading="lazy"
            />
            <Stack gap={4}>
              <Stack gap={2}>
                <Text variant="title-md" asChild>
                  <h2 id={titleId}>{demo.title}</h2>
                </Text>
                <Text variant="body" tone="secondary">
                  {demo.description}
                </Text>
              </Stack>
              <Stack gap={2}>
                <Text variant="label" asChild>
                  <h3>Made with</h3>
                </Text>
                <ComponentLinks names={demo.uses} />
              </Stack>
              <Inline gap={2}>
                <Button variant="primary" arrow="forward" asChild>
                  <a href={siteHref(`/demos/${demo.route}`)}>Open demo</a>
                </Button>
                <Button variant="secondary" asChild>
                  <a href={`${SOURCE_URL}/tree/main/apps/demos/${demo.route}`}>
                    View source
                  </a>
                </Button>
              </Inline>
            </Stack>
          </Grid>
          <Stack gap={2}>
            <Text variant="label" asChild>
              <h3>Start from this template</h3>
            </Text>
            <Text variant="body-sm" tone="secondary" asChild>
              <p>
                The{" "}
                <a
                  href={siteHref(`/templates/${demo.template}`)}
                  className="docs-link bt-focus"
                >
                  {demo.template} template
                </a>{" "}
                is {demo.title} without its content. In the buttery repository:
              </p>
            </Text>
            <CopyLine
              text={`pnpm new-app my-app --template ${demo.template}`}
              label="Copy the command"
            />
          </Stack>
        </section>
      </Stack>
    </Surface>
  );
}

/**
 * The demos page: each demo as a card with a picture of it, what it is and what it's made of, links to open
 * it and read its source, and the command that starts an app from its template.
 */
export function DemosPage(): ReactElement {
  const dark = useButtery().colorScheme === "dark";
  return (
    <Stack gap={8} asChild>
      <article className="docs-prose">
        <Stack gap={4}>
          <Text variant="heading-1" asChild>
            <h1>Demos</h1>
          </Text>
          <Text variant="body-lg">
            Small apps made only from buttery&apos;s components, each one a
            template with its own content. Each opens here as a site of its own
            and runs on its own too.
          </Text>
        </Stack>
        <Stack gap={6}>
          {demoPages.map((demo) => (
            <DemoCard key={demo.route} demo={demo} dark={dark} />
          ))}
        </Stack>
      </article>
    </Stack>
  );
}
