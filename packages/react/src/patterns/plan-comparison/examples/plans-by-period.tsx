import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, PlanComparison } from "@buttery/react";

const MONTHLY = { starter: 19, roaster: 39 };

/** Plans whose prices follow the billing period, kept in state and chosen in the control group. */
export function PlansByPeriod(): ReactElement {
  const [period, setPeriod] = useState("monthly");
  const [chosen, setChosen] = useState<string | undefined>(undefined);
  const yearly = period === "yearly";
  const price = (monthly: number): string =>
    `$${String(yearly ? monthly * 10 : monthly)}`;
  const per = yearly ? "a year" : "a month";
  return (
    <Stack gap={4}>
      <PlanComparison
        periods={[
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly" },
        ]}
        period={period}
        onPeriodChange={setPeriod}
        plans={[
          {
            id: "starter",
            name: "Starter",
            description: "For a roastery selling to its own customers.",
            price: price(MONTHLY.starter),
            period: yearly ? "per year" : "per month",
            action: (
              <Button
                variant="primary"
                onClick={() => {
                  setChosen(`Starter, ${price(MONTHLY.starter)} ${per}`);
                }}
              >
                Choose Starter
              </Button>
            ),
            featuresTitle: "Includes",
            features: ["Online shop", "Subscriptions"],
          },
          {
            id: "roaster",
            name: "Roaster",
            description: "For a roastery that also sells to cafés.",
            price: price(MONTHLY.roaster),
            period: yearly ? "per year" : "per month",
            ribbon: "30 days free",
            action: (
              <Button
                variant="primary"
                onClick={() => {
                  setChosen(
                    `Roaster, free for 30 days, then ${price(MONTHLY.roaster)} ${per}`,
                  );
                }}
              >
                Try Roaster
              </Button>
            ),
            featuresTitle: "Everything in Starter, and",
            features: ["Wholesale accounts", "Price lists"],
          },
        ]}
      />
      <Text variant="caption">
        {chosen === undefined ? "No plan chosen yet" : `Chosen: ${chosen}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Yearly");
  await see("$390");
  await press("button", "Try Roaster");
  await see("Chosen: Roaster, free for 30 days, then $390 a year");
};
