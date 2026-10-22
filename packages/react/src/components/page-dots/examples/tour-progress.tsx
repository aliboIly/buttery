import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, PageDots } from "@buttery/react";

const TITLES = ["Write a title", "Pick a finish", "Send it out"] as const;

/** Where a short tour is, under its step's title, with the buttons that move it. */
export function TourProgress(): ReactElement {
  const [step, setStep] = useState(0);
  return (
    <Stack gap={3} align="center">
      <Text variant="title">{TITLES[step]}</Text>
      <PageDots count={TITLES.length} value={step} />
      <Inline gap={2}>
        <Button
          size="sm"
          arrow="back"
          aria-disabled={step === 0}
          onClick={() => {
            setStep(Math.max(0, step - 1));
          }}
        >
          Back
        </Button>
        <Button
          size="sm"
          arrow="forward"
          aria-disabled={step === TITLES.length - 1}
          onClick={() => {
            setStep(Math.min(TITLES.length - 1, step + 1));
          }}
        >
          Next
        </Button>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Next");
  await see("Pick a finish");
  await press("button", "Back");
  await see("Write a title");
};
