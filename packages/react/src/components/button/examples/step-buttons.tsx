import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button } from "@buttery/react";

const STEPS = ["Pick a size", "Choose a background", "Add your title"];

/** Back and Next with arrows in equal columns; the last step finishes, so its button drops the arrow. */
export function StepButtons(): ReactElement {
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;
  return (
    <Stack gap={3} align="start">
      <Text variant="label">{STEPS[step]}</Text>
      <Inline gap={2} uniform>
        <Button
          arrow="back"
          aria-disabled={step === 0}
          onClick={() => {
            setStep(step - 1);
          }}
        >
          Back
        </Button>
        <Button
          variant="primary"
          {...(last ? {} : { arrow: "forward" as const })}
          onClick={() => {
            setStep(last ? 0 : step + 1);
          }}
        >
          {last ? "Finish" : "Next"}
        </Button>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Next");
  await see("Choose a background");
  await press("button", "Back");
  await see("Pick a size");
};
