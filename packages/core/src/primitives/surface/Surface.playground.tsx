import { Grid, Stack, Surface, surfaceLevels, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";

export const demos: readonly DemoSection[] = [
  {
    title: "Levels",
    description: "Background, edge, shadow and radius for each level.",
    render: () => (
      <Grid columns={2} gap={4}>
        {surfaceLevels.map((level) => (
          <Surface key={level} level={level} pad={4}>
            <Text variant="label">{level}</Text>
          </Surface>
        ))}
      </Grid>
    ),
  },
  {
    title: "Concentric nesting",
    description:
      'Each inner surface uses radius="auto": the parent\'s radius minus its padding.',
    render: () => (
      <Surface level="dialog">
        <Surface radius="auto" level="section" pad={3}>
          <Surface radius="auto" pad={4}>
            <Stack gap={1}>
              <Text variant="label">Dialog 18 → section 10 → card 4</Text>
              <Text variant="caption">Never less than 4px.</Text>
            </Stack>
          </Surface>
        </Surface>
      </Surface>
    ),
  },
];
