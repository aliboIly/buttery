import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, OptionTiles } from "@butteryui/react";

const PLANS = [
  {
    value: "shop",
    label: "Sell online",
    description: "Bags and gift boxes, shipped",
  },
  {
    value: "wholesale",
    label: "Sell to cafés",
    description: "Price lists and standing orders",
  },
  {
    value: "subscriptions",
    label: "Run subscriptions",
    description: "Coffee on a schedule",
  },
  {
    value: "counter",
    label: "Take payments at the counter",
    description: "Cards and phones in the shop",
  },
] as const;

type Plan = (typeof PLANS)[number]["value"];

/** A setup step: the big question, its tiles, and Continue, held back until something is chosen. */
export function SetupStep(): ReactElement {
  const [plans, setPlans] = useState<readonly Plan[]>([]);
  const [status, setStatus] = useState("Step 1 of 3");
  return (
    <Surface level="card" pad={6}>
      <Stack gap={5}>
        <Stack gap={2}>
          <Text variant="title">What will the roastery do first?</Text>
          <Text variant="body" tone="secondary">
            Pick as many as you like. You can change them later.
          </Text>
        </Stack>
        <OptionTiles
          label="What the roastery will do first"
          options={PLANS}
          value={plans}
          onValueChange={setPlans}
        />
        <Inline gap={3} align="center" justify="between">
          <Text variant="caption" tone="secondary">
            {status}
          </Text>
          <Button
            variant="primary"
            arrow="forward"
            aria-disabled={plans.length === 0}
            onClick={() => {
              const labels = PLANS.filter((plan) =>
                plans.includes(plan.value),
              ).map((plan) => plan.label);
              setStatus(`Next up: ${labels.join(", ")}`);
            }}
          >
            Continue
          </Button>
        </Inline>
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("checkbox", "Sell to cafés");
  await press("checkbox", "Run subscriptions");
  await press("button", "Continue");
  await see("Next up: Sell to cafés, Run subscriptions");
};
