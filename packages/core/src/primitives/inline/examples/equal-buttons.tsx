import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Inline, Pressable, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const STEPS = ["Pick a size", "Choose a theme", "Share your deck"] as const;

/** A tour's step buttons sharing the width equally, whatever their labels. */
export function EqualButtons(): ReactElement {
  const [step, setStep] = useState(STEPS.length - 1);
  const [finished, setFinished] = useState(false);
  const last = step === STEPS.length - 1;
  return (
    <Stack gap={3}>
      <Text variant="body">
        {finished
          ? "Tour finished"
          : `Step ${String(step + 1)} of ${String(STEPS.length)}: ${STEPS[step] ?? ""}`}
      </Text>
      <Inline gap={2} uniform>
        <Surface asChild level="raised" padX={4} padY={3}>
          <Center asChild>
            <Pressable
              aria-disabled={step === 0}
              onClick={() => {
                setFinished(false);
                setStep(step - 1);
              }}
            >
              <Text variant="button">Previous</Text>
            </Pressable>
          </Center>
        </Surface>
        <Surface asChild level="raised" padX={4} padY={3}>
          <Center asChild>
            <Pressable
              onClick={() => {
                if (last) setFinished(true);
                else setStep(step + 1);
              }}
            >
              <Text variant="button">
                {last ? "Finish the tour" : "Next step"}
              </Text>
            </Pressable>
          </Center>
        </Surface>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Previous");
  await see("Step 2 of 3: Choose a theme");
  await press("button", "Next step");
  await see("Step 3 of 3: Share your deck");
  await press("button", "Finish the tour");
  await see("Tour finished");
};
