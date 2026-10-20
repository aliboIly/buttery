import { useState } from "react";
import type { ReactElement } from "react";
import {
  Grid,
  Inline,
  Morph,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@buttery/core";
import type { DemoSection } from "@buttery/core";

function FillDemo(): ReactElement {
  const [fill, setFill] = useState<"blend" | "flat">("blend");
  return (
    <Stack gap={3} align="start">
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Pressable
          onClick={() => {
            setFill((current) => (current === "blend" ? "flat" : "blend"));
          }}
        >
          <Text variant="button">
            {fill === "blend" ? "Switch to flat" : "Switch to blend"}
          </Text>
        </Pressable>
      </Surface>
      <Surface
        level="card"
        pad={4}
        style={{ inlineSize: "var(--bt-w-dialog)", maxInlineSize: "100%" }}
      >
        <Morph contentKey={fill} data-testid="morph-fill">
          {fill === "blend" ? (
            <Grid columns={6} gap={2}>
              {Array.from({ length: 12 }, (_, index) => (
                <Surface key={index} level="inset" pad={4} />
              ))}
            </Grid>
          ) : (
            <Inline gap={2}>
              {Array.from({ length: 6 }, (_, index) => (
                <Surface key={index} level="inset" pad={4} />
              ))}
            </Inline>
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
