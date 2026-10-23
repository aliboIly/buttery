import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, PageDots } from "@butteryui/react";

const STEPS = [
  {
    title: "Welcome to the roastery",
    body: "Plan roasts, track green coffee and ship orders in one place.",
  },
  {
    title: "Plan the week's roasts",
    body: "Put batches on the days you roast, and their bags follow.",
  },
  {
    title: "Ship what's ready",
    body: "Orders show up packed and labelled once their roast has cooled.",
  },
] as const;

/** A welcome card: each step's title and line, the dots under them, and Skip beside Next, which turns into Finish. */
export function WelcomeCard(): ReactElement {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const last = step === STEPS.length - 1;
  const current = STEPS[step];
  return (
    <Surface level="card" pad={6}>
      <Stack gap={5}>
        <Stack gap={2}>
          <Text variant="title">
            {done ? "You're all set" : current?.title}
          </Text>
          <Text variant="body" tone="secondary">
            {done ? "Find this tour again under Help." : current?.body}
          </Text>
        </Stack>
        <Inline gap={3} align="center" justify="between">
          <PageDots count={STEPS.length} value={step} />
          {done ? (
            <Button
              onClick={() => {
                setStep(0);
                setDone(false);
              }}
            >
              Start over
            </Button>
          ) : (
            <Inline gap={2}>
              <Button
                variant="ghost"
                onClick={() => {
                  setDone(true);
                }}
              >
                Skip
              </Button>
              <Button
                variant="primary"
                {...(last ? {} : { arrow: "forward" as const })}
                onClick={() => {
                  if (last) setDone(true);
                  else setStep(step + 1);
                }}
              >
                {last ? "Finish" : "Next"}
              </Button>
            </Inline>
          )}
        </Inline>
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Next");
  await see("Plan the week's roasts");
  await press("button", "Next");
  await see("Ship what's ready");
  await press("button", "Finish");
  await see("You're all set");
};
