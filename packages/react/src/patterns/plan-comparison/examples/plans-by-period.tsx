import type { ExamplePlay } from "@buttery/core";
import { Button, PlanComparison } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

const MONTHLY = { starter: 19, roaster: 39 };

/** Plans whose prices follow the billing period chosen in the control group. */
export function PlansByPeriod(): ReactElement {
  const [period, setPeriod] = useState("monthly");
  const yearly = period === "yearly";
  const price = (monthly: number): string =>
    `$${String(yearly ? monthly * 10 : monthly)}`;
  return (
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
          action: <Button variant="primary">Choose Starter</Button>,
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
          action: <Button variant="primary">Try Roaster</Button>,
          featuresTitle: "Everything in Starter, and",
          features: ["Wholesale accounts", "Price lists"],
        },
      ]}
    />
  );
}

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "Yearly");
  await see("$390");
};
