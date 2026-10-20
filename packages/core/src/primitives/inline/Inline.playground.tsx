import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";

function Box({ label }: { readonly label: string }): ReactElement {
  return (
    <Surface level="raised" padX={3} padY={2}>
      <Text variant="label">{label}</Text>
    </Surface>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Gap",
    description: "Toolbar clusters use gap 1, button groups gap 2.",
    render: () => (
      <Inline gap={6} wrap>
        <Inline gap={1}>
          <Box label="gap 1" />
          <Box label="Two" />
        </Inline>
        <Inline gap={2}>
          <Box label="gap 2" />
          <Box label="Two" />
        </Inline>
      </Inline>
    ),
  },
  {
    title: "Uniform",
    description:
      "Children share the width equally, regardless of their content.",
    render: () => (
      <Inline gap={2} uniform>
        <Box label="Back" />
        <Box label="Continue to the next step" />
      </Inline>
    ),
  },
  {
    title: "Justify",
    description: "Start (the default), center, end and between.",
    render: () => (
      <Stack gap={2}>
        {(["start", "center", "end", "between"] as const).map((justify) => (
          <Surface key={justify} level="section" pad={2}>
            <Inline gap={2} justify={justify}>
              <Box label={justify} />
              <Box label="Two" />
            </Inline>
          </Surface>
        ))}
      </Stack>
    ),
  },
];
