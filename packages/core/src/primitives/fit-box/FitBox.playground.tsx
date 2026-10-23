import { FitBox, Grid, Stack, Surface, Text } from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";

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

interface LiveRatio {
  readonly value: number;
  readonly code: string;
}

const LIVE_RATIOS: Readonly<
  Record<"16:9" | "4:3" | "1:1" | "9:16", LiveRatio>
> = {
  "16:9": { value: 16 / 9, code: "16 / 9" },
  "4:3": { value: 4 / 3, code: "4 / 3" },
  "1:1": { value: 1, code: "1" },
  "9:16": { value: 9 / 16, code: "9 / 16" },
};

function ratioOf(value: unknown): LiveRatio {
  return LIVE_RATIOS[demoChoice(value, ["16:9", "4:3", "1:1", "9:16"])];
}

function insetOf(value: unknown): "4" | "0" | "2" | "8" {
  return demoChoice(value, ["4", "0", "2", "8"]);
}

export const live: LiveDemo = {
  controls: {
    ratio: {
      kind: "choice",
      options: ["16:9", "4:3", "1:1", "9:16"],
      initial: "16:9",
    },
    inset: { kind: "choice", options: ["0", "2", "4", "8"], initial: "4" },
  },
  render: ({ ratio, inset }) => (
    <Surface level="section" style={{ blockSize: "var(--bt-bento-row)" }}>
      <FitBox ratio={ratioOf(ratio).value} inset={insetOf(inset)}>
        <Surface level="card" />
      </FitBox>
    </Surface>
  ),
  code: ({ ratio, inset }) =>
    [
      `<FitBox ratio={${ratioOf(ratio).code}} inset={${insetOf(inset)}}>`,
      '  <Surface level="card" />',
      "</FitBox>",
    ].join("\n"),
};

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
