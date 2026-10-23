import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Morph, Pressable, Stack, Surface, Text } from "@butteryui/core";
import type { DemoSection, DocsPage } from "@butteryui/core";
import { gradientCss, gradients, solids } from "@butteryui/core/palettes";

export const page: DocsPage = {
  section: "motion",
  title: "Morph",
  description:
    "One container whose content swaps or grows: the height follows the content and swapped content crossfades in place.",
  order: 120,
  status: "stable",
  since: "0.3.0",
  home: "motion/presets",
};

function FillDemo(): ReactElement {
  const [fill, setFill] = useState<"gradient" | "solid">("gradient");
  return (
    <Stack gap={3} align="start">
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Pressable
          onClick={() => {
            setFill((current) =>
              current === "gradient" ? "solid" : "gradient",
            );
          }}
        >
          <Text variant="button">
            {fill === "gradient"
              ? "Switch to solid colors"
              : "Switch to gradients"}
          </Text>
        </Pressable>
      </Surface>
      <Surface
        level="card"
        pad={4}
        style={{ inlineSize: "var(--bt-w-dialog)", maxInlineSize: "100%" }}
      >
        <Morph contentKey={fill} data-testid="morph-fill">
          {fill === "gradient" ? (
            <Grid columns={6} gap={2}>
              {gradients.slice(0, 12).map((preset) => (
                <Surface
                  key={preset.id}
                  level="inset"
                  pad={4}
                  style={{ backgroundImage: gradientCss(preset) }}
                />
              ))}
            </Grid>
          ) : (
            <Grid columns={6} gap={2}>
              {solids.slice(0, 6).map((solid) => (
                <Surface
                  key={solid.id}
                  level="inset"
                  pad={4}
                  style={{ backgroundColor: solid.hex }}
                />
              ))}
            </Grid>
          )}
        </Morph>
      </Surface>
    </Stack>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Swapping content",
    description:
      "Two rows of swatches collapse into one: the panel's height follows with spring.smooth while the swatches crossfade in 120ms.",
    render: () => <FillDemo />,
  },
];
