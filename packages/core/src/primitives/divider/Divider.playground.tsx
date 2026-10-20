import { Divider, Inline, Stack, Surface, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";

export const demos: readonly DemoSection[] = [
  {
    title: "Horizontal",
    description: "Between groups in a column.",
    render: () => (
      <Surface level="card" pad={4}>
        <Stack gap={3}>
          <Text variant="label">Above</Text>
          <Divider />
          <Text variant="label">Below</Text>
        </Stack>
      </Surface>
    ),
  },
  {
    title: "Vertical",
    description: "Full height by default, or a length from the spacing scale.",
    render: () => (
      <Surface level="card" padX={4}>
        <Inline gap={3} padY={4}>
          <Text variant="label">Full</Text>
          <Divider orientation="vertical" />
          <Text variant="label">length 6</Text>
          <Divider orientation="vertical" length={6} />
          <Text variant="label">length 4</Text>
          <Divider orientation="vertical" length={4} />
          <Text variant="label">End</Text>
        </Inline>
      </Surface>
    ),
  },
];
