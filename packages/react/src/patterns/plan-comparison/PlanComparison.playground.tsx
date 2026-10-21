import type { DemoFrame, DemoSection, DocsPage } from "@buttery/core";
import { Button, PlanComparison } from "@buttery/react";

export const page: DocsPage = {
  section: "patterns",
  title: "Plans",
  description:
    "Plans side by side under one control group, their parts lined up.",
  order: 60,
  status: "new",
  since: "0.7.0",
};

export const frame: DemoFrame = "page";

export const demos: readonly DemoSection[] = [
  {
    title: "Three plans",
    description:
      "The cards share their rows, so prices, actions and checklists line up.",
    render: () => (
      <PlanComparison
        periods={[
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly" },
        ]}
        volumes={[
          { value: "small", label: "Up to 200 orders" },
          { value: "large", label: "Up to 2,000 orders" },
        ]}
        plans={[
          {
            id: "starter",
            name: "Starter",
            description: "For a roastery selling to its own customers.",
            price: "$19",
            period: "per month",
            action: <Button variant="primary">Choose Starter</Button>,
            featuresTitle: "Includes",
            features: ["Online shop", "Subscriptions"],
          },
          {
            id: "roaster",
            name: "Roaster",
            description: "For a roastery that also sells to cafés.",
            price: "$39",
            period: "per month",
            ribbon: "30 days free",
            action: <Button variant="primary">Try Roaster</Button>,
            featuresTitle: "Everything in Starter, and",
            features: ["Wholesale accounts", "Price lists", "Roast planning"],
          },
          {
            id: "estate",
            name: "Estate",
            description: "For roasteries with more than one site.",
            price: "$89",
            period: "per month",
            ribbon: "30 days free",
            action: <Button variant="primary">Try Estate</Button>,
            featuresTitle: "Everything in Roaster, and",
            features: ["Several sites", "Shared green coffee stock"],
          },
        ]}
        more={
          <PlanComparison.Option
            name="Enterprise"
            description="Prices for large roasteries, set with you."
            action={<Button size="sm">Talk to us</Button>}
          />
        }
      />
    ),
  },
];
