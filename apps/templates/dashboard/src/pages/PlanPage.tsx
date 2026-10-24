import { useState } from "react";
import type { ReactElement } from "react";
import {
  AppPage,
  Breadcrumbs,
  Button,
  PageHeader,
  PlanComparison,
  toast,
} from "@butteryui/react";
import { useLink } from "../router.tsx";

type Plan = "starter" | "growth";

const PLANS: Readonly<
  Record<Plan, { readonly name: string; readonly monthly: number }>
> = {
  starter: { name: "Starter", monthly: 19 },
  growth: { name: "Growth", monthly: 49 },
};

/** The plans side by side under Settings, the shop's own marked, with a button to switch to the other. */
export function PlanPage(): ReactElement {
  const link = useLink();
  const [period, setPeriod] = useState("monthly");
  const [current, setCurrent] = useState<Plan>("starter");
  const yearly = period === "yearly";
  const price = (plan: Plan): string =>
    `$${String(yearly ? PLANS[plan].monthly * 10 : PLANS[plan].monthly)}`;
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
          toast.success(`The shop is on ${PLANS[plan].name} now.`);
        }}
      >
        {`Switch to ${PLANS[plan].name}`}
      </Button>
    );
  return (
    <AppPage
      header={
        <PageHeader
          title="Plan"
          breadcrumbs={
            <Breadcrumbs
              items={[{ label: "Settings", href: link("/settings") }]}
            />
          }
          description={`The shop is on ${PLANS[current].name}. Yearly plans cost ten months.`}
        />
      }
    >
      <AppPage.Section>
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
              name: PLANS.starter.name,
              description: "For a shop selling online.",
              price: price("starter"),
              period: yearly ? "per year" : "per month",
              action: action("starter"),
              featuresTitle: "Includes",
              features: ["Orders and products", "Returns", "Email receipts"],
            },
            {
              id: "growth",
              name: PLANS.growth.name,
              description: "For a shop with regular customers.",
              price: price("growth"),
              period: yearly ? "per year" : "per month",
              ribbon: "30 days free",
              action: action("growth"),
              featuresTitle: "Everything in Starter, and",
              features: ["Subscriptions", "Discount codes", "Team accounts"],
            },
          ]}
        />
      </AppPage.Section>
    </AppPage>
  );
}
