import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Accordion, Button } from "@butteryui/react";

const STEPS = [
  {
    value: "rinse",
    title: "Rinse the filter",
    body: "Pour hot water through the paper filter, then pour that water away.",
  },
  {
    value: "bloom",
    title: "Let it bloom",
    body: "Add 15 g of coffee and pour twice its weight of water. Wait 30 seconds.",
  },
  {
    value: "pour",
    title: "Pour the rest",
    body: "Pour slow circles up to 250 g of water, keeping the dripper half full.",
  },
] as const;

/** A pour-over guide whose page keeps the open step, so Next step opens the one after it. */
export function BrewStepByStep(): ReactElement {
  const [step, setStep] = useState<string>("rinse");
  const index = STEPS.findIndex((candidate) => candidate.value === step);
  const next = STEPS[index + 1];
  return (
    <Stack gap={4}>
      <Accordion variant="cards" value={step} onValueChange={setStep}>
        {STEPS.map((candidate, at) => (
          <Accordion.Item
            key={candidate.value}
            value={candidate.value}
            title={candidate.title}
            description={`Step ${String(at + 1)} of ${String(STEPS.length)}`}
          >
            {candidate.body}
          </Accordion.Item>
        ))}
      </Accordion>
      <Inline gap={3} align="center">
        <Button
          variant="primary"
          disabled={next === undefined}
          onClick={() => {
            if (next !== undefined) setStep(next.value);
          }}
        >
          Next step
        </Button>
        <Text variant="caption" tone="secondary">
          {next === undefined ? "That's the cup." : `Then: ${next.title}`}
        </Text>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Then: Let it bloom");
  await press("button", "Next step");
  await see(/^Add 15 g of coffee/);
  await see("Then: Pour the rest");
};
