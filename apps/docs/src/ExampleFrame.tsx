import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@buttery/core";
import { Button } from "@buttery/react";
import { CodeHtml } from "./CodeBlock.tsx";
import type { DemoFrame } from "@buttery/core";
import type { Example } from "./registry.ts";

/**
 * One example, live: its caption, the example in a frame, and its source behind "Show code", from the same
 * file the example renders from.
 */
export function ExampleFrame({
  example,
  frame = "section",
  headingId,
}: {
  readonly example: Example;
  readonly frame?: DemoFrame;
  readonly headingId?: string;
}): ReactElement {
  const [showing, setShowing] = useState(false);
  const { Component, code, title } = example;
  return (
    <Stack gap={3}>
      <Stack gap={1}>
        <Text variant="label" asChild>
          <h3 id={headingId}>{title}</h3>
        </Text>
        {code.caption === "" ? null : (
          <Text variant="body-sm" tone="secondary">
            {code.caption}
          </Text>
        )}
      </Stack>
      <Surface
        level={frame === "page" ? "card" : "section"}
        pad={6}
        radius="lg"
        className="pg-stage"
      >
        <Component />
      </Surface>
      <Inline gap={2}>
        <Button
          size="sm"
          variant="ghost"
          aria-expanded={showing}
          onClick={() => {
            setShowing(!showing);
          }}
        >
          {showing ? "Hide code" : "Show code"}
        </Button>
      </Inline>
      {showing ? <CodeHtml html={code.html} language="tsx" /> : null}
    </Stack>
  );
}
