import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Morph, Pressable, Stack, Surface, Text } from "@buttery/core";

const STEPS = [
  {
    title: "Bring in a photo",
    body: "Drop an image on the canvas, or paste one.",
  },
  {
    title: "Give it a style",
    body: "Pick an edge, a backdrop and a little depth. Everything updates as you go, so try a few before you settle.",
  },
] as const;

/** Step text that crossfades in place while its block grows or shrinks to fit. */
export function StepText(): ReactElement {
  const [index, setIndex] = useState(0);
  const step = STEPS[index] ?? STEPS[0];
  return (
    <Stack gap={4} align="start">
      <Morph contentKey={index}>
        <Stack gap={3}>
          <Text variant="title">{step.title}</Text>
          <Text variant="body">{step.body}</Text>
        </Stack>
      </Morph>
      <Inline gap={2}>
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Pressable
            onClick={() => {
              setIndex((current) => (current + 1) % STEPS.length);
            }}
          >
            <Text variant="button">Next step</Text>
          </Pressable>
        </Surface>
      </Inline>
    </Stack>
  );
}
