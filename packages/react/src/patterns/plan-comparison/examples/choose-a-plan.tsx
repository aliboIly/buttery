import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, PlanComparison } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

/** Choosing a plan from its card, the plan in use marked on its own button. */
export function ChooseAPlan(): ReactElement {
  const [current, setCurrent] = useState("starter");
  const action = (id: string, label: string): ReactElement =>
    id === current ? (
      <Button variant="soft" aria-disabled>
        Your plan
      </Button>
    ) : (
      <Button
        variant="primary"
        onClick={() => {
          setCurrent(id);
        }}
      >
        {label}
      </Button>
    );
  return (
    <Stack gap={4}>
      <PlanComparison
        plans={[
          {
            id: "starter",
            name: "Starter",
            description: "For a roastery selling to its own customers.",
            price: "$19",
            period: "per month",
            action: action("starter", "Choose Starter"),
            featuresTitle: "Includes",
            features: ["Online shop", "Subscriptions"],
          },
          {
            id: "roaster",
            name: "Roaster",
            description: "For a roastery that also sells to cafés.",
            price: "$39",
            period: "per month",
            action: action("roaster", "Choose Roaster"),
            featuresTitle: "Everything in Starter, and",
            features: ["Wholesale accounts", "Price lists"],
          },
        ]}
      />
      <Text variant="caption">{`On the ${current} plan`}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Choose Roaster");
  await see("On the roaster plan");
};
