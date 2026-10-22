import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Presence, Pressable, Stack, Surface, Text } from "@buttery/core";
import type { DemoSection, DocsPage, PresencePreset } from "@buttery/core";

export const page: DocsPage = {
  section: "motion",
  title: "Presence",
  description:
    "Shows and hides its content with an enter and an exit preset; exits are quicker than entrances.",
  order: 130,
  status: "stable",
  since: "0.3.0",
  home: "motion/presets",
};

const PRESETS: readonly PresencePreset[] = [
  "fade",
  "rise",
  "pop",
  "toast",
  "menu",
  "dialog",
  "scrim",
];

function PresetDemo({
  preset,
}: {
  readonly preset: PresencePreset;
}): ReactElement {
  const [show, setShow] = useState(false);
  return (
    <Stack gap={3} align="start">
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Pressable
          aria-pressed={show}
          onClick={() => {
            setShow((current) => !current);
          }}
        >
          <Text variant="button">
            {show ? `Hide ${preset}` : `Show ${preset}`}
          </Text>
        </Pressable>
      </Surface>
      <Presence show={show} preset={preset} data-testid={`presence-${preset}`}>
        <Surface level="floating" padX={4} padY={3}>
          <Text variant="label">{preset}</Text>
        </Surface>
      </Presence>
    </Stack>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Presets",
    description:
      "Each preset arrives its own way and leaves with a 120ms fade. Turn on reduced motion to see the 100ms fade that replaces them all.",
    render: () => (
      <Grid columns={2} gap={6}>
        {PRESETS.map((preset) => (
          <PresetDemo key={preset} preset={preset} />
        ))}
      </Grid>
    ),
  },
];
