import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@buttery/core";
import { CodeHtml } from "./CodeBlock.tsx";
import { CodeToggle } from "./CodeToggle.tsx";
import { DesktopPreview } from "./DesktopPreview.tsx";
import { withInlineCode } from "./inline-code.tsx";
import type { DemoFrame, DemoWidth } from "@buttery/core";
import type { Example } from "./registry.ts";

/** The title and caption over an example or a variant's drawing, alike in both sections of a page. */
export function DemoHeading({
  title,
  caption = "",
  level,
  id,
}: {
  readonly title: string;
  /** A line or two of Markdown under the title; code between backticks shows as code. */
  readonly caption?: string | undefined;
  readonly level: 3 | 4;
  readonly id?: string | undefined;
}): ReactElement {
  return (
    <Stack gap={1}>
      <Text variant="label" asChild>
        {level === 3 ? <h3 id={id}>{title}</h3> : <h4 id={id}>{title}</h4>}
      </Text>
      {caption === "" ? null : (
        <Text variant="body-sm" tone="secondary" className="docs-caption">
          {withInlineCode(caption)}
        </Text>
      )}
    </Stack>
  );
}

/**
 * One example, live: its caption, the example in a frame, and its source behind "Show code", from the same
 * file the example renders from.
 */
export function ExampleFrame({
  example,
  frame = "section",
  width = "frame",
  headingId,
  headingLevel = 3,
}: {
  readonly example: Example;
  readonly frame?: DemoFrame;
  /** Whether the example lays out at its frame's width or, scaled down to fit, a desktop's. Defaults to `"frame"`. */
  readonly width?: DemoWidth;
  readonly headingId?: string;
  /** The level of the example's title among the page's headings. Defaults to 3. */
  readonly headingLevel?: 3 | 4;
}): ReactElement {
  const [showing, setShowing] = useState(false);
  const { Component, code, title } = example;
  return (
    <Stack gap={3}>
      <DemoHeading
        title={title}
        caption={code.caption}
        level={headingLevel}
        id={headingId}
      />
      <Surface
        level={frame === "page" ? "card" : "section"}
        pad={6}
        radius="lg"
        className="pg-stage"
        data-docs-example=""
      >
        {width === "desktop" ? (
          <DesktopPreview>
            <Component />
          </DesktopPreview>
        ) : (
          <Component />
        )}
      </Surface>
      <Inline>
        <CodeToggle
          open={showing}
          label={title}
          onToggle={() => {
            setShowing(!showing);
          }}
        />
      </Inline>
      {showing ? <CodeHtml html={code.html} language="tsx" /> : null}
    </Stack>
  );
}
