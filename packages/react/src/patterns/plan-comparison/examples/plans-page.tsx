import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, PageHeader, PlanComparison } from "@buttery/react";

const MONTHLY = {
  starter: { small: 19, large: 49 },
  roaster: { small: 39, large: 99 },
} as const;

type Plan = keyof typeof MONTHLY;

type Volume = keyof (typeof MONTHLY)["starter"];

const NAMES: Readonly<Record<Plan, string>> = {
  starter: "Starter",
  roaster: "Roaster",
};

/** A plans page under settings: its header, the period and volume over the plans, the plan in use marked, and other plans under them. */
export function PlansPage(): ReactElement {
  const [period, setPeriod] = useState("monthly");
  const [volume, setVolume] = useState<Volume>("small");
  const [current, setCurrent] = useState<Plan>("starter");
  const [asked, setAsked] = useState(false);
  const yearly = period === "yearly";
  const price = (plan: Plan): string => {
    const monthly = MONTHLY[plan][volume];
    return `$${String(yearly ? monthly * 10 : monthly)}`;
  };
  const action = (plan: Plan): ReactElement =>
    plan === current ? (
      <Button variant="soft" aria-disabled>
        Your plan
      </Button>
    ) : (
      <Button
        variant="primary"
        onClick={() => {
          setCurrent(plan);
        }}
      >
        {`Switch to ${NAMES[plan]}`}
      </Button>
    );
  return (
    <Stack gap={6}>
      <PageHeader
        title="Plans"
        description="Pick what the roastery pays for. You can change it any time."
      />
      <PlanComparison
        periods={[
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly" },
        ]}
        period={period}
        onPeriodChange={setPeriod}
        volumes={[
          { value: "small", label: "Up to 200 orders" },
          { value: "large", label: "Up to 2,000 orders" },
        ]}
        volume={volume}
        onVolumeChange={(next) => {
          setVolume(next === "large" ? "large" : "small");
        }}
        plans={[
          {
            id: "starter",
            name: "Starter",
            description: "For a roastery selling to its own customers.",
            price: price("starter"),
            period: yearly ? "per year" : "per month",
            action: action("starter"),
            featuresTitle: "Includes",
            features: ["Online shop", "Subscriptions"],
          },
          {
            id: "roaster",
            name: "Roaster",
            description: "For a roastery that also sells to cafés.",
            price: price("roaster"),
            period: yearly ? "per year" : "per month",
            ribbon: "30 days free",
            action: action("roaster"),
            featuresTitle: "Everything in Starter, and",
            features: ["Wholesale accounts", "Price lists", "Roast planning"],
          },
        ]}
        more={
          <PlanComparison.Option
            name="Enterprise"
            description="Prices for roasteries with more than one site, set with you."
            action={
              <Button
                size="sm"
                aria-disabled={asked}
                onClick={() => {
                  setAsked(true);
                }}
              >
                {asked ? "We'll email you" : "Talk to us"}
              </Button>
            }
          />
        }
      />
      <Text variant="caption">{`On the ${NAMES[current]} plan`}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Yearly");
  await see("$390");
  await press("button", "Switch to Roaster");
  await see("On the Roaster plan");
};
