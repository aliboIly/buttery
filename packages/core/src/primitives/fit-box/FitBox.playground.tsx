import { FitBox, Grid, Stack, Surface, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";

export const page: DocsPage = {
  section: "layout",
  title: "FitBox",
  description:
    "Draws its content in the largest box of a given aspect ratio that fits, always centered.",
  order: 50,
  status: "stable",
  since: "0.2.0",
};

const RATIOS = [
  { label: "16:9", ratio: 16 / 9 },
  { label: "1:1", ratio: 1 },
  { label: "9:16", ratio: 9 / 16 },
] as const;

export const demos: readonly DemoSection[] = [
  {
    title: "Ratios",
    description:
      "The same space holding three ratios; each box is as large as fits.",
    render: () => (
      <Grid columns={3} gap={4}>
        {RATIOS.map(({ label, ratio }) => (
          <Stack key={label} gap={2}>
            <Text variant="caption">{label}</Text>
            <Surface
              level="section"
              style={{ blockSize: "var(--bt-bento-row)" }}
            >
              <FitBox ratio={ratio} inset={4}>
                <Surface level="card" />
              </FitBox>
            </Surface>
          </Stack>
        ))}
      </Grid>
    ),
  },
];
