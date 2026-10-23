import { useState } from "react";
import type { ReactElement } from "react";
import {
  Inline,
  Morph,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

const STEPS = [
  {
    title: "Soften the butter",
    body: "Leave it out for half an hour, until a spoon slides in.",
  },
  {
    title: "Cream it with sugar",
    body: "Beat them together until pale and fluffy. It takes a few minutes longer than you'd think, so keep going until it looks like whipped cream.",
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

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Next step");
  await see("Cream it with sugar");
  await press("button", "Next step");
  await see("Soften the butter");
};
