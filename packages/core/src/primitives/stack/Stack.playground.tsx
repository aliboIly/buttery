import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import type { DemoSection, DocsPage, SpaceValue } from "@buttery/core";

export const page: DocsPage = {
  section: "layout",
  title: "Stack",
  description:
    "Lays children out in a column with a gap from the spacing scale.",
  order: 200,
  status: "stable",
  since: "0.2.0",
};

function Box({ label }: { readonly label: string }): ReactElement {
  return (
    <Surface level="raised" padX={3} padY={2}>
      <Text variant="label">{label}</Text>
    </Surface>
  );
}

const GAPS: readonly SpaceValue[] = [1, 2, 4, 6];

export const demos: readonly DemoSection[] = [
  {
    title: "Gap",
    description:
      "The same three boxes at gaps 1, 2, 4 and 6 (4, 8, 16 and 24px).",
    render: () => (
      <Stack gap={6}>
        {GAPS.map((gap) => (
          <Stack key={String(gap)} gap={gap}>
            <Box label={`gap ${String(gap)}`} />
            <Box label="Second" />
            <Box label="Third" />
          </Stack>
        ))}
      </Stack>
    ),
  },
  {
    title: "Alignment",
    description: "Stretch (the default), start, center and end.",
    render: () => (
      <Stack gap={4}>
        {(["stretch", "start", "center", "end"] as const).map((align) => (
          <Surface key={align} level="section" pad={2}>
            <Stack gap={2} align={align}>
              <Box label={align} />
              <Box label="A wider second box" />
            </Stack>
          </Surface>
        ))}
      </Stack>
    ),
  },
];
