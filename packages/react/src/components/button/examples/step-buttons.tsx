import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import { Button } from "@buttery/react";

const STEPS = ["Pick a size", "Choose a background", "Add your title"];

/** Back and Next with arrows; the last step finishes, so its button drops the arrow. */
export function StepButtons(): ReactElement {
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;
  return (
    <Inline gap={3} align="center" wrap>
      <Text variant="label">{STEPS[step]}</Text>
      <Inline gap={2}>
        <Button
          arrow="back"
          disabled={step === 0}
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
    </Inline>
  );
}
