import {
  Inline,
  Loop,
  Morph,
  Presence,
  Stack,
  Surface,
  Text,
} from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";

export const page: DocsPage = {
  section: "motion",
  title: "Loop",
  description:
    "Cycles a living demo through its steps, pausing off screen and under reduced motion.",
  order: 110,
  status: "stable",
  since: "0.3.0",
  home: "motion/presets",
};

const TOTALS = ["1,204", "1,318", "1,472"] as const;

export const demos: readonly DemoSection[] = [
  {
    title: "A living card",
    description:
      "The card steps through three states every four seconds: the total crossfades and a row appears. It pauses off screen and holds still with reduced motion.",
    render: () => (
      <Surface
        level="card"
        pad={6}
        style={{ inlineSize: "var(--bt-w-dialog)", maxInlineSize: "100%" }}
      >
        <Loop steps={3}>
          {(step) => (
            <Stack gap={3}>
              <Text variant="caption">Decks exported this week</Text>
              <Morph contentKey={step}>
                <Text variant="heading-2" tabular>
                  {TOTALS[step]}
                </Text>
              </Morph>
              <Presence show={step === 2} preset="rise">
                <Inline gap={2}>
                  <Text variant="label">Spring launch</Text>
                  <Text variant="caption">just now</Text>
                </Inline>
              </Presence>
            </Stack>
          )}
        </Loop>
      </Surface>
    ),
  },
];
